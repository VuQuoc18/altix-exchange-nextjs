/**
 * Run: npx tsx --test scripts/migrate/transform.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { htmlToBlocks, sectionsToBlocks, homeToBlocks, splitCallout, clearedLegacyHomeFields, type MigrationWarning } from "./transform";
import { collectText, segmentContent } from "../../src/lib/blocks";
import { hasLegacyHomeFields } from "../../src/lib/home-copy";

const seed = JSON.parse(fs.readFileSync(new URL("./fixtures/legacy-seed.json", import.meta.url), "utf8"));
const pages: Array<{ slug: string; data: Record<string, any> }> = seed.content.pages;
const page = (slug: string) => pages.find((p) => p.slug === slug)!;

const words = (s: string) => s.split(/\s+/).filter(Boolean);
/** Multiset of words — order-insensitive, catches any dropped text. */
function bag(value: unknown): Map<string, number> {
	const m = new Map<string, number>();
	for (const w of words(collectText(value).join(" "))) m.set(w, (m.get(w) ?? 0) + 1);
	return m;
}
function missingWords(before: unknown, after: unknown): string[] {
	const a = bag(after);
	const missing: string[] = [];
	for (const [w, n] of bag(before)) if ((a.get(w) ?? 0) < n) missing.push(w);
	return missing;
}

test("htmlToBlocks: paragraphs, links and entities", () => {
	let n = 0;
	const key = (h: string) => `${h}${++n}`;
	const blocks = htmlToBlocks('<p>Hello &amp; <strong>bold</strong></p><p>Mail <a href="mailto:a@b.c">us</a>.</p>', key);
	assert.equal(blocks.length, 2);
	assert.deepEqual(
		(blocks[0]!.children as any[]).map((c) => [c.text, c.marks]),
		[
			["Hello & ", []],
			["bold", ["strong"]],
		],
	);
	const link = (blocks[1]!.markDefs as any[])[0];
	assert.equal(link.href, "mailto:a@b.c");
	assert.deepEqual((blocks[1]!.children as any[])[1].marks, [link._key]);
});

test("htmlToBlocks: refuses unknown tags instead of dropping them", () => {
	assert.throws(() => htmlToBlocks("<p>a <table></table></p>", (h) => h));
});

test("splitCallout extracts bold lead-in", () => {
	assert.deepEqual(splitCallout("<strong>Pre-launch legal task:</strong> replace wording."), {
		label: "Pre-launch legal task:",
		text: "replace wording.",
	});
});

test("every seed page migrates without losing a single word", () => {
	for (const p of pages) {
		if (p.slug === "home" || !Array.isArray(p.data.sections)) continue;
		const warnings: MigrationWarning[] = [];
		const blocks = sectionsToBlocks(p.slug, p.data.sections, warnings);
		// Compare against what the legacy renderer actually DISPLAYED: drop
		// scaffolding that is regenerated (card/step numbers) and fields the old
		// renderer ignored for that section type.
		const NOT_RENDERED: Record<string, string[]> = {
			empty_state: ["eyebrow", "title", "subtitle"],
			form: ["subtitle"],
			legal: ["eyebrow"],
			faq: ["eyebrow"],
		};
		const before = p.data.sections.map((s: any) => {
			const { type, cards, processSteps, ...rest } = s;
			for (const f of NOT_RENDERED[type] ?? []) delete rest[f];
			return {
				...rest,
				cards: cards?.map(({ no, ...c }: any) => c),
				processSteps: processSteps?.map(({ no, ...st }: any) => st),
			};
		});
		const missing = missingWords(before, blocks);
		assert.deepEqual(missing, [], `${p.slug} lost words: ${missing.join(" ")}`);
		const keys = blocks.map((b) => b._key);
		assert.equal(new Set(keys).size, keys.length, `${p.slug} has duplicate _key`);
	}
});

test("case-readiness becomes one checklist block with all 11 items", () => {
	const blocks = sectionsToBlocks("case-readiness", page("case-readiness").data.sections);
	assert.equal(blocks.length, 1);
	assert.equal(blocks[0]!._type, "altix.checklist");
	assert.equal(String(blocks[0]!.items).split("\n").length, 11);
});

test("privacy: intro + rich text + callout group into ONE flow section (legacy layout)", () => {
	const blocks = sectionsToBlocks("privacy", page("privacy").data.sections);
	const segs = segmentContent(blocks);
	assert.equal(segs.length, 1);
	assert.equal(segs[0]!.kind, "flow");
	const flow = segs[0] as Extract<(typeof segs)[number], { kind: "flow" }>;
	assert.equal(flow.intro?._type, "altix.intro");
	assert.equal(flow.blocks.at(-1)!._type, "altix.callout");
});

test("expert-network form keeps its #apply anchor", () => {
	const blocks = sectionsToBlocks("expert-network", page("expert-network").data.sections);
	assert.equal(blocks.find((b) => b._type === "altix.form")!.anchor, "apply");
});

test("about: never-rendered 'standard' section is migrated hidden", () => {
	const warnings: MigrationWarning[] = [];
	const blocks = sectionsToBlocks("about", page("about").data.sections, warnings);
	assert.equal(blocks[0]!._type, "altix.intro");
	assert.equal(blocks[0]!.hidden, true);
	assert.equal(segmentContent(blocks).length, 1, "hidden block must not render");
	assert.equal(warnings.length, 1);
});

test("about-leadership untyped sections become a card grid", () => {
	const blocks = sectionsToBlocks("about-leadership", page("about-leadership").data.sections);
	assert.equal(blocks[0]!._type, "altix.cardGrid");
	assert.equal((blocks[0]!.cards as any[])[0].title, "Background & Experience");
});

test("unknown section types fail loudly", () => {
	assert.throws(() => sectionsToBlocks("x", [{ type: "mystery" }]));
});

test("homepage: flat fields win over JSON/blocks, order is canonical, insights added", () => {
	const data = page("home").data;
	const blocks = homeToBlocks(data);
	assert.deepEqual(
		blocks.map((b) => b._type),
		["altix.hero", "altix.whatWeDo", "altix.ecosystem", "altix.process", "altix.underwriting", "altix.roadmap", "altix.leadership", "altix.insights", "altix.ctaBand"],
	);
	const hero = blocks[0]!;
	if (data.hero_eyebrow) assert.equal(hero.eyebrow, data.hero_eyebrow);
	// Ecosystem points are stored as one-per-line text for the form.
	const eco = blocks[2]!.items as any[];
	assert.equal(typeof eco[0].points, "string");
	// Nothing that was displayed is lost.
	const missing = missingWords(
		[data.hero_eyebrow, data.wwd_title, data.eco_title, data.proc_title, data.uw_title, data.rm_title, data.lead_title, data.cta_title],
		blocks,
	);
	assert.deepEqual(missing, []);
});

test("homepage: after clearing legacy fields, the page counts as migrated", () => {
	const data = page("home").data;
	assert.equal(hasLegacyHomeFields(data), true);
	const migrated = { ...data, ...clearedLegacyHomeFields(data), content: homeToBlocks(data) };
	assert.equal(hasLegacyHomeFields(migrated), false);
	assert.ok(!("hero_cta_label" in clearedLegacyHomeFields({ hero_cta_label: "x" })));
});
