#!/usr/bin/env tsx
/**
 * Migrate the "Pages" collection to editor-friendly blocks.
 *
 * Steps (run in this order; every step is idempotent):
 *
 *   schema       Add the new page fields, give every field a plain-English
 *                label and put them in a sensible order.
 *   content      Convert each page's legacy storage into blocks in "Page content":
 *                  - JSON `sections` → Card grid / Checklist / Steps / FAQ / … blocks
 *                  - legal HTML       → rich text (headings + paragraphs)
 *                  - homepage flat + JSON fields → ordered homepage blocks
 *                A JSON backup of every page is written before it is changed.
 *   drop-legacy  Delete the legacy fields from the schema. Refuses to run while
 *                any page still holds data in them.
 *   seed         Rewrite seed/seed.json (+ .emdash/seed.json) in the new shape so
 *                fresh installs start migrated.
 *
 * Usage:
 *   npx tsx scripts/migrate-to-blocks.ts <step…> [--dry-run] [--url <site>]
 *
 *   npx tsx scripts/migrate-to-blocks.ts schema content --dry-run
 *   npx tsx scripts/migrate-to-blocks.ts schema content
 *   npx tsx scripts/migrate-to-blocks.ts drop-legacy
 *   npx tsx scripts/migrate-to-blocks.ts content --url https://altix.exchange
 *
 * Auth: localhost uses the dev bypass. For a remote site set EMDASH_TOKEN
 * (Admin → Settings → API tokens) or run `npx emdash login --url <site>` first.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EmDashClient } from "emdash/client";
import { sectionsToBlocks, homeToBlocks, clearedLegacyHomeFields, type MigrationWarning } from "./migrate/transform";
import { legacyHomeFieldNames, hasLegacyHomeFields } from "../src/lib/home-copy";
import { toBool, type PTBlock } from "../src/lib/blocks";

// ── Target schema for the "pages" collection ────────────────────────────

type FieldSpec = { slug: string; type: string; label: string };

/** Final editor-facing fields, in display order. */
const PAGE_FIELDS: FieldSpec[] = [
	{ slug: "title", type: "string", label: "Page title" },
	{ slug: "eyebrow", type: "string", label: "Small label above the title (optional)" },
	{ slug: "lead", type: "text", label: "Intro paragraph under the title" },
	{ slug: "hero_cta_label", type: "string", label: "Hero button text (optional)" },
	{ slug: "hero_cta_url", type: "string", label: "Hero button link (e.g. /submit-a-matter)" },
	{ slug: "microcopy", type: "text", label: "Small print under the hero button (optional)" },
	{ slug: "content", type: "portableText", label: "Page content — add, drag and edit sections here" },
	{ slug: "show_cta_band", type: "boolean", label: "Show the “Start here” call-to-action band at the bottom" },
];

/** Pages that historically had no bottom CTA band. Mirrors [slug].astro. */
const NO_CTA_BAND = new Set(["thank-you", "contact", "submit-a-matter", "request-institutional-access"]);

/** Fields that only existed for the old storage format. */
function isLegacyField(slug: string): boolean {
	return (
		legacyHomeFieldNames({ [slug]: true }).length > 0 ||
		slug === "sections" ||
		slug === "notice" ||
		slug === "contact"
	);
}

// ── CLI args ────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string) => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 ? argv[i + 1] : undefined;
};
const steps = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--url");
const DRY = flag("dry-run");
const baseUrl = opt("url") || process.env.EMDASH_URL || "http://localhost:4321";
const ROOT = path.resolve(new URL("..", import.meta.url).pathname);

if (steps.length === 0 || steps.some((s) => !["schema", "content", "drop-legacy", "seed"].includes(s))) {
	console.error("Usage: npx tsx scripts/migrate-to-blocks.ts <schema|content|drop-legacy|seed…> [--dry-run] [--url <site>]");
	process.exit(1);
}

function storedToken(url: string): string | undefined {
	try {
		const file = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "emdash", "auth.json");
		const all = JSON.parse(fs.readFileSync(file, "utf8"));
		const cred = all[new URL(url).origin];
		if (cred && new Date(cred.expiresAt) > new Date()) return cred.accessToken;
	} catch {}
	return undefined;
}

function makeClient(): EmDashClient {
	const isLocal = /localhost|127\.0\.0\.1/.test(baseUrl);
	const token = process.env.EMDASH_TOKEN || storedToken(baseUrl);
	if (!token && !isLocal) {
		console.error(`No credentials for ${baseUrl}. Set EMDASH_TOKEN or run: npx emdash login --url ${baseUrl}`);
		process.exit(1);
	}
	return new EmDashClient({ baseUrl, token, devBypass: !token && isLocal });
}

/** EmDashClient has no public method for field updates / reordering. */
function api<T>(client: EmDashClient, method: string, p: string, body?: unknown): Promise<T> {
	return (client as any).request(method, p, body);
}

const log = (...a: unknown[]) => console.log(DRY ? "[dry-run]" : "", ...a);

/** "altix.intro → rich text ×8 → altix.callout" */
function describeBlocks(blocks: PTBlock[]): string {
	const parts: string[] = [];
	let run = 0;
	for (const b of [...blocks, { _type: "__end" }]) {
		if (b._type === "block") {
			run++;
			continue;
		}
		if (run) parts.push(`rich text ×${run}`);
		run = 0;
		if (b._type !== "__end") parts.push(String(b._type).replace(/^altix\./, "") + (b.hidden ? " (hidden)" : ""));
	}
	return parts.join(" → ");
}

// ── Steps ───────────────────────────────────────────────────────────────

async function stepSchema(client: EmDashClient) {
	const col = await client.collection("pages");
	const existing = new Map(col.fields.map((f: any) => [f.slug, f]));

	for (const spec of PAGE_FIELDS) {
		const cur = existing.get(spec.slug);
		if (!cur) {
			log(`+ add field ${spec.slug} (${spec.type}) "${spec.label}"`);
			if (!DRY) await client.createField("pages", { ...spec, validation: null } as any);
		} else if (cur.label !== spec.label) {
			log(`~ relabel ${spec.slug}: "${cur.label}" → "${spec.label}"`);
			if (!DRY) await api(client, "PUT", `/schema/collections/pages/fields/${spec.slug}`, { label: spec.label, validation: cur.validation ?? null });
		}
	}

	const order = [
		...PAGE_FIELDS.map((f) => f.slug),
		...col.fields.map((f: any) => f.slug).filter((s: string) => !PAGE_FIELDS.some((f) => f.slug === s)),
	];
	log(`= field order: ${PAGE_FIELDS.map((f) => f.slug).join(", ")}, then legacy fields`);
	if (!DRY) await api(client, "POST", `/schema/collections/pages/fields/reorder`, { fieldSlugs: order });
}

async function listPages(client: EmDashClient) {
	const items: any[] = [];
	let cursor: string | undefined;
	do {
		const res = await client.list("pages", { limit: 100, cursor });
		items.push(...res.items);
		cursor = res.nextCursor;
	} while (cursor);
	return items;
}

function planPage(slug: string, data: Record<string, any>, warnings: MigrationWarning[]): Record<string, unknown> | null {
	if (slug === "home") {
		if (!hasLegacyHomeFields(data)) return null;
		return { ...clearedLegacyHomeFields(data), content: homeToBlocks(data, warnings) };
	}
	const sections = Array.isArray(data.sections) ? data.sections : [];
	const hasContent = Array.isArray(data.content) && data.content.length > 0;
	const update: Record<string, unknown> = {};
	if (sections.length > 0) {
		if (hasContent) {
			warnings.push({ slug, message: "has BOTH blocks and legacy sections — sections are appended after the existing blocks." });
		}
		update.content = [...(hasContent ? (data.content as PTBlock[]) : []), ...sectionsToBlocks(slug, sections, warnings)];
		update.sections = null;
	}
	if (toBool(data.show_cta_band) === undefined) update.show_cta_band = !NO_CTA_BAND.has(slug);
	return Object.keys(update).length ? update : null;
}

async function stepContent(client: EmDashClient) {
	// The server may briefly serve a cached schema right after the schema step.
	let ready = false;
	for (let attempt = 0; attempt < 10 && !ready; attempt++) {
		const col = await client.collection("pages");
		ready = col.fields.some((f: any) => f.slug === "show_cta_band");
		if (!ready) await new Promise((r) => setTimeout(r, 1000));
	}
	if (!ready && !DRY) {
		throw new Error('Run the "schema" step first (field show_cta_band is missing).');
	}
	const backupDir = path.join(ROOT, "backups", `pages-${new Date().toISOString().replace(/[:.]/g, "-")}`);
	const warnings: MigrationWarning[] = [];
	const summary: string[] = [];

	for (const item of await listPages(client)) {
		const full = await client.get("pages", item.id, { raw: true });
		const slug = full.slug || item.id;
		// A real pending draft has its own revision; draft === live just means "nothing pending".
		if (full.draftRevisionId && full.draftRevisionId !== full.liveRevisionId) {
			summary.push(`SKIP  ${slug}: has unpublished draft changes — publish or discard them in the admin, then re-run.`);
			continue;
		}
		const update = planPage(slug, full.data, warnings);
		if (!update) {
			summary.push(`ok    ${slug}: already migrated`);
			continue;
		}
		const blocks = Array.isArray(update.content) ? (update.content as PTBlock[]) : [];
		summary.push(
			`MIGR  ${slug}: ${blocks.length ? describeBlocks(blocks) : "(no content change)"}` +
				(update.show_cta_band !== undefined ? ` | CTA band: ${update.show_cta_band ? "on" : "off"}` : ""),
		);
		if (DRY) continue;

		fs.mkdirSync(backupDir, { recursive: true });
		fs.writeFileSync(path.join(backupDir, `${slug}.json`), JSON.stringify(full, null, 2));
		const updated = await client.update("pages", item.id, { data: update, _rev: full._rev });
		if (updated.draftRevisionId) await client.publish("pages", item.id);
	}

	console.log("\n" + summary.join("\n"));
	if (warnings.length) console.log("\nNotes:\n" + warnings.map((w) => `  - ${w.slug}: ${w.message}`).join("\n"));
	if (!DRY && fs.existsSync(backupDir)) console.log(`\nBackups: ${path.relative(ROOT, backupDir)}`);
}

async function stepDropLegacy(client: EmDashClient) {
	const col = await client.collection("pages");
	const legacy = col.fields.map((f: any) => f.slug).filter(isLegacyField);
	const blockers: string[] = [];
	for (const item of await listPages(client)) {
		const { data, slug } = await client.get("pages", item.id, { raw: true });
		const filled = legacy.filter((k: string) => {
			const v = data[k];
			return v != null && v !== "" && !(Array.isArray(v) && v.length === 0) && !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);
		});
		if (filled.length) blockers.push(`${slug}: ${filled.join(", ")}`);
	}
	if (blockers.length) {
		throw new Error(`Legacy fields still hold data — run the "content" step first:\n  ${blockers.join("\n  ")}`);
	}
	for (const slug of legacy) {
		log(`- remove field ${slug}`);
		if (!DRY) await client.deleteField("pages", slug);
	}
	log(`${legacy.length} legacy fields ${DRY ? "would be" : ""} removed.`);
}

function stepSeed() {
	for (const rel of ["seed/seed.json", ".emdash/seed.json"]) {
		const file = path.join(ROOT, rel);
		if (!fs.existsSync(file)) continue;
		const seed = JSON.parse(fs.readFileSync(file, "utf8"));
		const pagesCol = seed.collections.find((c: any) => c.slug === "pages");
		const warnings: MigrationWarning[] = [];

		// Fields: new shape, plain-English labels, legacy removed.
		const keep = pagesCol.fields.filter((f: any) => !isLegacyField(f.slug));
		pagesCol.fields = PAGE_FIELDS.map((spec) => {
			const prev = keep.find((f: any) => f.slug === spec.slug) ?? {};
			return { ...prev, slug: spec.slug, label: spec.label, type: spec.type };
		}).concat(keep.filter((f: any) => !PAGE_FIELDS.some((s) => s.slug === f.slug)));

		for (const page of seed.content.pages) {
			const update = planPage(page.slug, page.data, warnings) ?? {};
			const data = { ...page.data, ...update };
			for (const k of Object.keys(data)) if (isLegacyField(k) || data[k] === null) delete data[k];
			page.data = data;
		}
		log(`rewrite ${rel} (${seed.content.pages.length} pages)`);
		if (!DRY) fs.writeFileSync(file, JSON.stringify(seed, null, "\t") + "\n");
		if (warnings.length) console.log(warnings.map((w) => `  - ${w.slug}: ${w.message}`).join("\n"));
	}
}

// ── Main ────────────────────────────────────────────────────────────────

const client = steps.some((s) => s !== "seed") ? makeClient() : null;
console.log(`Target: ${steps.includes("seed") && steps.length === 1 ? "seed files" : baseUrl}${DRY ? " (dry run — nothing will be changed)" : ""}`);
for (const step of steps) {
	console.log(`\n── ${step} ──`);
	if (step === "schema") await stepSchema(client!);
	if (step === "content") await stepContent(client!);
	if (step === "drop-legacy") await stepDropLegacy(client!);
	if (step === "seed") stepSeed();
}
