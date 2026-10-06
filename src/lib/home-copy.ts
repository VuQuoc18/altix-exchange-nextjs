export type EditAttrs = Record<string, unknown>;

export type HomeEditMap = Record<string, EditAttrs | undefined>;

type Block = Record<string, unknown> & { _type?: string };

function firstString(...values: unknown[]): string | undefined {
	for (const value of values) {
		if (typeof value === "string" && value.length > 0) return value;
	}
	return undefined;
}

function asBlock(value: unknown): Block {
	return value && typeof value === "object" ? (value as Block) : {};
}

function splitLines(value: unknown): string[] | undefined {
	if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
	if (typeof value !== "string" || !value.trim()) return undefined;
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function blocksByType(content: unknown): Record<string, Block> {
	if (!Array.isArray(content)) return {};
	const map: Record<string, Block> = {};
	for (const item of content) {
		const block = asBlock(item);
		if (typeof block._type === "string") map[block._type] = block;
	}
	return map;
}

/**
 * LEGACY homepage fields. Older content stored each homepage section in flat
 * fields (hero_eyebrow, wwd_title, …) and per-section JSON fields. The
 * migration folds them into the `altix.*` blocks in `content` and clears them.
 */
export const LEGACY_HOME_JSON_FIELDS = [
	"hero",
	"what_we_do",
	"ecosystem",
	"process",
	"underwriting",
	"roadmap",
	"leadership",
	"cta_band",
] as const;

export const LEGACY_HOME_FLAT_PREFIXES = ["hero_", "wwd_", "eco_", "proc_", "uw_", "rm_", "lead_", "cta_"] as const;

/** Inner-page fields that share a legacy prefix but are NOT homepage leftovers. */
const NOT_LEGACY = new Set(["hero_cta_label", "hero_cta_url"]);

export function legacyHomeFieldNames(pageData: Record<string, unknown>): string[] {
	return Object.keys(pageData).filter(
		(key) =>
			(LEGACY_HOME_JSON_FIELDS as readonly string[]).includes(key) ||
			(LEGACY_HOME_FLAT_PREFIXES.some((p) => key.startsWith(p)) && !NOT_LEGACY.has(key)),
	);
}

function isFilled(value: unknown): boolean {
	if (value == null) return false;
	if (typeof value === "string") return value.trim() !== "";
	if (Array.isArray(value)) return value.length > 0;
	if (typeof value === "object") return Object.keys(value as object).length > 0;
	return true;
}

/** True while any legacy homepage field still holds data (i.e. not migrated yet). */
export function hasLegacyHomeFields(pageData: Record<string, unknown>): boolean {
	return legacyHomeFieldNames(pageData).some((key) => isFilled(pageData[key]));
}

export function homeFromPage(pageData: Record<string, any>, edit?: HomeEditMap) {
	const blocks = blocksByType(pageData.content);
	const heroBlock = { ...asBlock(pageData.hero), ...asBlock(blocks["altix.hero"]) };
	const wwdBlock = { ...asBlock(pageData.what_we_do), ...asBlock(blocks["altix.whatWeDo"]) };
	const ecoBlock = { ...asBlock(pageData.ecosystem), ...asBlock(blocks["altix.ecosystem"]) };
	const procBlock = { ...asBlock(pageData.process), ...asBlock(blocks["altix.process"]) };
	const uwBlock = { ...asBlock(pageData.underwriting), ...asBlock(blocks["altix.underwriting"]) };
	const rmBlock = { ...asBlock(pageData.roadmap), ...asBlock(blocks["altix.roadmap"]) };
	const leadBlock = { ...asBlock(pageData.leadership), ...asBlock(blocks["altix.leadership"]) };
	const ctaBlock = { ...asBlock(pageData.cta_band), ...asBlock(blocks["altix.ctaBand"]) };

	return {
		hero: {
			data: {
				eyebrow: firstString(pageData.hero_eyebrow, heroBlock.eyebrow),
				headlineBefore: firstString(pageData.hero_headline_before, heroBlock.headlineBefore),
				headlineAccent: firstString(pageData.hero_headline_accent, heroBlock.headlineAccent),
				leadStrong: firstString(pageData.hero_lead_strong, heroBlock.leadStrong),
				leadRest: firstString(pageData.hero_lead_rest, heroBlock.leadRest),
				primaryCta: firstString(pageData.hero_primary_cta, heroBlock.primaryCta),
				secondaryCta: firstString(pageData.hero_secondary_cta, heroBlock.secondaryCta),
				badge1: firstString(pageData.hero_badge_1, heroBlock.badge1),
				badge2: firstString(pageData.hero_badge_2, heroBlock.badge2),
				badge3: firstString(pageData.hero_badge_3, heroBlock.badge3),
				disclaimer: firstString(pageData.hero_disclaimer, heroBlock.disclaimer),
			},
			fields: {
				eyebrow: edit?.hero_eyebrow,
				headlineBefore: edit?.hero_headline_before,
				headlineAccent: edit?.hero_headline_accent,
				leadStrong: edit?.hero_lead_strong,
				leadRest: edit?.hero_lead_rest,
				primaryCta: edit?.hero_primary_cta,
				secondaryCta: edit?.hero_secondary_cta,
				badge1: edit?.hero_badge_1,
				badge2: edit?.hero_badge_2,
				badge3: edit?.hero_badge_3,
				disclaimer: edit?.hero_disclaimer,
			},
		},
		whatWeDo: {
			data: {
				eyebrow: firstString(pageData.wwd_eyebrow, wwdBlock.eyebrow),
				title: firstString(pageData.wwd_title, wwdBlock.title),
				body: firstString(pageData.wwd_body, wwdBlock.body),
				cards: wwdBlock.cards,
			},
			fields: {
				eyebrow: edit?.wwd_eyebrow,
				title: edit?.wwd_title,
				body: edit?.wwd_body,
			},
		},
		ecosystem: {
			data: {
				eyebrow: firstString(pageData.eco_eyebrow, ecoBlock.eyebrow),
				title: firstString(pageData.eco_title, ecoBlock.title),
				body: firstString(pageData.eco_body, ecoBlock.body),
				items: Array.isArray(ecoBlock.items)
					? ecoBlock.items.map((item: Record<string, unknown>) => ({
							...item,
							points: splitLines(item.points),
						}))
					: ecoBlock.items,
			},
			fields: {
				eyebrow: edit?.eco_eyebrow,
				title: edit?.eco_title,
				body: edit?.eco_body,
			},
		},
		process: {
			data: {
				eyebrow: firstString(pageData.proc_eyebrow, procBlock.eyebrow),
				title: firstString(pageData.proc_title, procBlock.title),
				body: firstString(pageData.proc_body, procBlock.body),
				steps: procBlock.steps,
			},
			fields: {
				eyebrow: edit?.proc_eyebrow,
				title: edit?.proc_title,
				body: edit?.proc_body,
			},
		},
		underwriting: {
			data: {
				eyebrow: firstString(pageData.uw_eyebrow, uwBlock.eyebrow),
				title: firstString(pageData.uw_title, uwBlock.title),
				body: firstString(pageData.uw_body, uwBlock.body),
				items: uwBlock.items,
			},
			fields: {
				eyebrow: edit?.uw_eyebrow,
				title: edit?.uw_title,
				body: edit?.uw_body,
			},
		},
		roadmap: {
			data: {
				eyebrow: firstString(pageData.rm_eyebrow, rmBlock.eyebrow),
				title: firstString(pageData.rm_title, rmBlock.title),
				body: firstString(pageData.rm_body, rmBlock.body),
				items: rmBlock.items,
			},
			fields: {
				eyebrow: edit?.rm_eyebrow,
				title: edit?.rm_title,
				body: edit?.rm_body,
			},
		},
		leadership: {
			data: {
				eyebrow: firstString(pageData.lead_eyebrow, leadBlock.eyebrow),
				title: firstString(pageData.lead_title, leadBlock.title),
				body: firstString(pageData.lead_body, leadBlock.body),
				kicker: firstString(pageData.lead_kicker, leadBlock.kicker),
				name: firstString(pageData.lead_name, leadBlock.name),
				role: firstString(pageData.lead_role, leadBlock.role),
				stat1Title: firstString(pageData.lead_stat1_title, leadBlock.stat1Title),
				stat1Body: firstString(pageData.lead_stat1_body, leadBlock.stat1Body),
				stat2Title: firstString(pageData.lead_stat2_title, leadBlock.stat2Title),
				stat2Body: firstString(pageData.lead_stat2_body, leadBlock.stat2Body),
				cta: firstString(pageData.lead_cta, leadBlock.cta),
				photoUrl: firstString(leadBlock.photoUrl),
			},
			fields: {
				eyebrow: edit?.lead_eyebrow,
				title: edit?.lead_title,
				body: edit?.lead_body,
				kicker: edit?.lead_kicker,
				name: edit?.lead_name,
				role: edit?.lead_role,
				stat1Title: edit?.lead_stat1_title,
				stat1Body: edit?.lead_stat1_body,
				stat2Title: edit?.lead_stat2_title,
				stat2Body: edit?.lead_stat2_body,
				cta: edit?.lead_cta,
			},
		},
		ctaBand: {
			data: {
				eyebrow: firstString(pageData.cta_eyebrow, ctaBlock.eyebrow),
				title: firstString(pageData.cta_title, ctaBlock.title),
				body: firstString(pageData.cta_body, ctaBlock.body),
				button: firstString(pageData.cta_button, ctaBlock.button),
			},
			fields: {
				eyebrow: edit?.cta_eyebrow,
				title: edit?.cta_title,
				body: edit?.cta_body,
				button: edit?.cta_button,
			},
		},
	};
}
