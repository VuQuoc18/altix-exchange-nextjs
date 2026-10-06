/**
 * Pure transforms used by scripts/migrate-to-blocks.ts.
 *
 * Converts the legacy page storage (JSON `sections`, flat homepage fields,
 * per-section homepage JSON, HTML legal copy) into Portable Text blocks that
 * editors manage with forms. No I/O here, so it is unit-testable.
 */
import { homeFromPage, legacyHomeFieldNames } from "../../src/lib/home-copy";
import { pad2, type PTBlock } from "../../src/lib/blocks";

export interface MigrationWarning {
	slug: string;
	message: string;
}

// ── Keys ────────────────────────────────────────────────────────────────

/** Deterministic, unique-per-document Portable Text keys. */
function keyMaker(seed: string) {
	let n = 0;
	return (hint: string) => {
		n += 1;
		return `${seed}-${hint}-${n}`.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 48);
	};
}
type KeyFn = ReturnType<typeof keyMaker>;

/** Drop undefined / empty-string values so blocks stay tidy. */
function clean<T extends Record<string, unknown>>(obj: T): T {
	return Object.fromEntries(
		Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""),
	) as T;
}

// ── HTML → Portable Text (legal copy) ───────────────────────────────────

const ENTITIES: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
	"&apos;": "'",
	"&nbsp;": " ",
};

function decodeEntities(s: string): string {
	return s
		.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m)
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

/**
 * Converts simple HTML (p, a, strong/b, em/i, br) to Portable Text blocks.
 * Throws on tags it does not understand so nothing is silently lost.
 */
export function htmlToBlocks(html: string, key: KeyFn, style = "normal"): PTBlock[] {
	const blocks: PTBlock[] = [];
	const paragraphs = /<p[\s>]/i.test(html)
		? [...html.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)].map((m) => m[1]!)
		: [html];

	const outside = html.replace(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/gi, "").trim();
	if (/<p[\s>]/i.test(html) && outside) {
		throw new Error(`Text outside <p> tags would be lost: ${outside.slice(0, 80)}`);
	}

	for (const inner of paragraphs) {
		const markDefs: Array<Record<string, unknown>> = [];
		const children: Array<Record<string, unknown>> = [];
		const active: string[] = [];
		for (const token of inner.split(/(<[^>]+>)/g)) {
			if (!token) continue;
			const tag = token.match(/^<(\/?)([a-z0-9]+)([^>]*)>$/i);
			if (!tag) {
				const text = decodeEntities(token);
				if (text) children.push({ _type: "span", _key: key("s"), text, marks: [...active] });
				continue;
			}
			const [, closing, nameRaw, attrs] = tag;
			const name = nameRaw!.toLowerCase();
			if (name === "br") {
				children.push({ _type: "span", _key: key("s"), text: "\n", marks: [...active] });
				continue;
			}
			const mark = name === "strong" || name === "b" ? "strong" : name === "em" || name === "i" ? "em" : name === "a" ? "link" : null;
			if (!mark) throw new Error(`Unsupported HTML tag <${name}> in legal copy`);
			if (closing) {
				// close the most recent matching mark
				for (let i = active.length - 1; i >= 0; i--) {
					const isLink = markDefs.some((d) => d._key === active[i]);
					if ((mark === "link" && isLink) || active[i] === mark) {
						active.splice(i, 1);
						break;
					}
				}
			} else if (mark === "link") {
				const href = attrs!.match(/href\s*=\s*"([^"]*)"/i)?.[1] ?? attrs!.match(/href\s*=\s*'([^']*)'/i)?.[1];
				if (!href) throw new Error("Link without href in legal copy");
				const defKey = key("link");
				markDefs.push({ _type: "link", _key: defKey, href: decodeEntities(href) });
				active.push(defKey);
			} else {
				active.push(mark);
			}
		}
		// Trim leading/trailing whitespace of the paragraph
		if (children.length) {
			const first = children[0]!;
			const last = children[children.length - 1]!;
			first.text = String(first.text).replace(/^\s+/, "");
			last.text = String(last.text).replace(/\s+$/, "");
		}
		const nonEmpty = children.filter((c) => String(c.text) !== "");
		if (!nonEmpty.length) continue;
		blocks.push({ _type: "block", _key: key("p"), style, markDefs, children: nonEmpty });
	}
	return blocks;
}

function headingBlock(text: string, key: KeyFn, style = "h3"): PTBlock {
	return {
		_type: "block",
		_key: key("h"),
		style,
		markDefs: [],
		children: [{ _type: "span", _key: key("s"), text, marks: [] }],
	};
}

/** "<strong>Label:</strong> rest" → { label, text }. Plain text → { text }. */
export function splitCallout(html: string): { label?: string; text: string } {
	const m = html.match(/^\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/i);
	const strip = (s: string) => decodeEntities(s.replace(/<[^>]+>/g, "")).trim();
	if (m) return { label: strip(m[1]!), text: strip(m[2]!) };
	return { text: strip(html) };
}

// ── Legacy `sections` JSON → blocks ─────────────────────────────────────

const FORM_ANCHORS: Record<string, string> = { "expert-network": "apply" };
const DEFAULT_PERSON_PHOTO = "/assets/img/elke-biechele.webp";

function checkNumbering(slug: string, kind: string, items: Array<{ no?: string }>, warnings: MigrationWarning[]): boolean {
	const numbers = items.map((i) => i.no).filter(Boolean);
	if (numbers.length === 0) return false;
	const sequential = items.every((item, i) => item.no === pad2(i + 1));
	if (!sequential) {
		warnings.push({ slug, message: `${kind} numbers ${JSON.stringify(numbers)} are not 01,02,…; they will be renumbered automatically.` });
	}
	return true;
}

export function sectionsToBlocks(slug: string, sections: unknown, warnings: MigrationWarning[] = []): PTBlock[] {
	if (!Array.isArray(sections)) return [];
	const key = keyMaker(slug);
	const out: PTBlock[] = [];

	for (const raw of sections) {
		const sec = (raw ?? {}) as Record<string, any>;
		const head = { eyebrow: sec.eyebrow, title: sec.title, subtitle: sec.subtitle };

		switch (sec.type) {
			case "cards": {
				const cards = Array.isArray(sec.cards) ? sec.cards : [];
				out.push(
					clean({
						_type: "altix.cardGrid",
						_key: key("cards"),
						...head,
						numbered: checkNumbering(slug, "Card", cards, warnings),
						cards: cards.map((c: any) => clean({ title: c.title, description: c.description, linkText: c.linkText, linkUrl: c.linkUrl })),
					}),
				);
				break;
			}
			case "check_grid":
				out.push(clean({ _type: "altix.checklist", _key: key("check"), ...head, items: (sec.checkItems ?? []).join("\n") }));
				break;
			case "process": {
				const steps = Array.isArray(sec.processSteps) ? sec.processSteps : [];
				checkNumbering(slug, "Step", steps, warnings);
				out.push(
					clean({
						_type: "altix.steps",
						_key: key("steps"),
						...head,
						steps: steps.map((s: any) => clean({ title: s.title, description: s.desc })),
					}),
				);
				break;
			}
			case "faq":
				out.push(
					clean({
						_type: "altix.faq",
						_key: key("faq"),
						...head,
						openFirst: true,
						items: (sec.faqItems ?? []).map((f: any) => clean({ question: f.question, answer: f.answer })),
					}),
				);
				break;
			case "legal": {
				// Legacy legal sections never showed the eyebrow.
				out.push(clean({ _type: "altix.intro", _key: key("intro"), title: sec.title, subtitle: sec.subtitle }));
				for (const item of sec.legalItems ?? []) {
					if (item.heading) out.push(headingBlock(item.heading, key));
					if (item.body) out.push(...htmlToBlocks(item.body, key));
				}
				if (sec.callout) out.push(clean({ _type: "altix.callout", _key: key("callout"), ...splitCallout(sec.callout) }));
				break;
			}
			case "form":
				out.push(
					clean({
						_type: "altix.form",
						_key: key("form"),
						eyebrow: sec.eyebrow,
						title: sec.title,
						formType: sec.formType,
						formNote: sec.formNote,
						anchor: FORM_ANCHORS[slug],
					}),
				);
				break;
			case "leadership":
				out.push(
					clean({
						_type: "altix.person",
						_key: key("person"),
						...head,
						photo: DEFAULT_PERSON_PHOTO,
						name: sec.leadership?.title,
						role: sec.leadership?.description,
						linkText: "View profile →",
						linkUrl: sec.leadership?.linkUrl,
					}),
				);
				break;
			case "empty_state":
				out.push(
					clean({
						_type: "altix.notice",
						_key: key("notice"),
						title: sec.emptyState?.title,
						description: sec.emptyState?.description,
					}),
				);
				break;
			case "standard":
				// The legacy renderer had no branch for "standard", so it never
				// appeared on the site. Keep the content but hidden.
				out.push(clean({ _type: "altix.intro", _key: key("intro"), ...head, hidden: true }));
				warnings.push({ slug, message: `"standard" section "${sec.title}" was never displayed; migrated as a hidden Intro block.` });
				break;
			default:
				if (!sec.type && (sec.title || sec.body)) {
					// Untyped {title, body} cards (about-leadership profile page).
					const last = out[out.length - 1];
					const card = clean({ title: sec.title, description: sec.body ?? sec.description });
					if (last?._type === "altix.cardGrid" && last._untyped) (last.cards as unknown[]).push(card);
					else out.push({ _type: "altix.cardGrid", _key: key("cards"), _untyped: true, cards: [card] });
					break;
				}
				throw new Error(`[${slug}] Unknown legacy section type: ${JSON.stringify(sec.type)}`);
		}
	}
	for (const b of out) delete b._untyped;
	return out;
}

// ── Homepage ────────────────────────────────────────────────────────────

const HOME_ORDER = [
	"altix.hero",
	"altix.whatWeDo",
	"altix.ecosystem",
	"altix.process",
	"altix.underwriting",
	"altix.roadmap",
	"altix.leadership",
	"altix.insights",
	"altix.ctaBand",
] as const;

/**
 * Folds flat fields + per-section JSON + existing blocks into one ordered list
 * of homepage blocks, using exactly the precedence the legacy renderer used
 * (homeFromPage: flat field → block → JSON field).
 */
export function homeToBlocks(pageData: Record<string, any>, warnings: MigrationWarning[] = []): PTBlock[] {
	const key = keyMaker("home");
	const merged = homeFromPage(pageData);
	const join = (v: unknown) => (Array.isArray(v) ? v.join("\n") : v);

	const byType: Record<(typeof HOME_ORDER)[number], Record<string, unknown>> = {
		"altix.hero": merged.hero.data,
		"altix.whatWeDo": merged.whatWeDo.data,
		"altix.ecosystem": {
			...merged.ecosystem.data,
			items: (merged.ecosystem.data.items as any[] | undefined)?.map((i) => clean({ ...i, points: join(i.points) })),
		},
		"altix.process": merged.process.data,
		"altix.underwriting": merged.underwriting.data,
		"altix.roadmap": merged.roadmap.data,
		"altix.leadership": merged.leadership.data,
		"altix.insights": {},
		"altix.ctaBand": merged.ctaBand.data,
	};

	const homeBlocks = HOME_ORDER.map((type) => clean({ _type: type, _key: key(type.split(".")[1]!), ...byType[type] }) as PTBlock);

	const extras = (Array.isArray(pageData.content) ? pageData.content : []).filter(
		(b: PTBlock) => !(HOME_ORDER as readonly string[]).includes(String(b._type)),
	);
	if (extras.length) {
		warnings.push({ slug: "home", message: `${extras.length} extra block(s) kept after the homepage sections: ${extras.map((b: PTBlock) => b._type).join(", ")}` });
	}
	return [...homeBlocks, ...extras];
}

/** Payload that clears every legacy homepage field present on the page. */
export function clearedLegacyHomeFields(pageData: Record<string, unknown>): Record<string, null> {
	return Object.fromEntries(legacyHomeFieldNames(pageData).map((k) => [k, null]));
}
