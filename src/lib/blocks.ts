/**
 * Helpers shared by block renderers and the content migration.
 * Kept free of Astro imports so they can be unit-tested with `node --test`.
 */

export type PTBlock = Record<string, unknown> & { _type?: string; _key?: string };

/** "1" → "01" — automatic numbering for cards and steps. */
export function pad2(n: number): string {
	return String(n).padStart(2, "0");
}

/**
 * Boolean fields are stored as INTEGER in SQLite/D1 and may come back as 1/0.
 * Returns undefined when the value was never set.
 */
export function toBool(value: unknown): boolean | undefined {
	if (value === true || value === 1 || value === "1" || value === "true") return true;
	if (value === false || value === 0 || value === "0" || value === "false") return false;
	return undefined;
}

/** Accepts a newline-separated string or a string array; returns trimmed, non-empty lines. */
export function splitLines(value: unknown): string[] {
	if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
	if (typeof value !== "string") return [];
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

/** Native Portable Text blocks (paragraphs, headings, lists) and core media. */
const FLOW_TYPES = new Set(["block", "image", "gallery"]);
/** Plugin blocks that render inline inside a rich-text section. */
const INLINE_PLUGIN_TYPES = new Set(["altix.callout"]);

export function isFlowBlock(block: PTBlock): boolean {
	return FLOW_TYPES.has(String(block._type)) || INLINE_PLUGIN_TYPES.has(String(block._type));
}

export type Segment =
	| { kind: "section"; block: PTBlock }
	| { kind: "flow"; intro?: PTBlock; blocks: PTBlock[] };

/**
 * Splits page content into renderable segments:
 *
 * - Section blocks (cards, checklist, hero, …) render on their own.
 * - Consecutive rich-text blocks (paragraphs, headings, images, callouts) are
 *   grouped into one "flow" section so they share a container.
 * - An Intro block directly followed by rich text becomes that flow's heading,
 *   reproducing the legacy legal-page layout (one section: heading + copy).
 *
 * Hidden blocks (`hidden: true`) are dropped first.
 */
export function segmentContent(content: unknown): Segment[] {
	if (!Array.isArray(content)) return [];
	const blocks = (content as PTBlock[]).filter((b) => b && typeof b === "object" && !b.hidden);
	const segments: Segment[] = [];
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i]!;
		if (isFlowBlock(block)) {
			const last = segments[segments.length - 1];
			if (last?.kind === "flow") last.blocks.push(block);
			else segments.push({ kind: "flow", blocks: [block] });
			continue;
		}
		const next = blocks[i + 1];
		if (block._type === "altix.intro" && next && isFlowBlock(next)) {
			segments.push({ kind: "flow", intro: block, blocks: [] });
			continue;
		}
		segments.push({ kind: "section", block });
	}
	return segments;
}

/** Collects every human-readable string in a value (for migration text-loss checks). */
export function collectText(value: unknown, out: string[] = []): string[] {
	if (typeof value === "string") {
		const t = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
		if (t) out.push(t);
	} else if (Array.isArray(value)) {
		for (const v of value) collectText(v, out);
	} else if (value && typeof value === "object") {
		for (const [k, v] of Object.entries(value)) {
			if (k.startsWith("_") || k === "type" || k === "style" || k === "listItem" || k === "markDefs" || k === "marks") continue;
			collectText(v, out);
		}
	}
	return out;
}
