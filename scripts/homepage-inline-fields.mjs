/** Shared homepage inline-edit field list used by seed + D1 migration. */
export const HOME_INLINE_FIELDS = [
	["hero_eyebrow", "Hero — Eyebrow"],
	["hero_headline_before", "Hero — Headline before accent"],
	["hero_headline_accent", "Hero — Headline accent"],
	["hero_lead_strong", "Hero — Lead (strong)"],
	["hero_lead_rest", "Hero — Lead (rest)"],
	["hero_primary_cta", "Hero — Primary CTA"],
	["hero_secondary_cta", "Hero — Secondary CTA"],
	["hero_badge_1", "Hero — Badge 1"],
	["hero_badge_2", "Hero — Badge 2"],
	["hero_badge_3", "Hero — Badge 3"],
	["hero_disclaimer", "Hero — Disclaimer"],
	["wwd_eyebrow", "What we do — Eyebrow"],
	["wwd_title", "What we do — Title"],
	["wwd_body", "What we do — Body"],
	["eco_eyebrow", "Ecosystem — Eyebrow"],
	["eco_title", "Ecosystem — Title"],
	["eco_body", "Ecosystem — Body"],
	["proc_eyebrow", "Process — Eyebrow"],
	["proc_title", "Process — Title"],
	["proc_body", "Process — Body"],
	["uw_eyebrow", "Underwriting — Eyebrow"],
	["uw_title", "Underwriting — Title"],
	["uw_body", "Underwriting — Body"],
	["rm_eyebrow", "Roadmap — Eyebrow"],
	["rm_title", "Roadmap — Title"],
	["rm_body", "Roadmap — Body"],
	["lead_eyebrow", "Leadership — Eyebrow"],
	["lead_title", "Leadership — Title"],
	["lead_body", "Leadership — Body"],
	["lead_kicker", "Leadership — Kicker"],
	["lead_name", "Leadership — Name"],
	["lead_role", "Leadership — Role"],
	["lead_stat1_title", "Leadership — Stat 1 title"],
	["lead_stat1_body", "Leadership — Stat 1 body"],
	["lead_stat2_title", "Leadership — Stat 2 title"],
	["lead_stat2_body", "Leadership — Stat 2 body"],
	["lead_cta", "Leadership — CTA"],
	["cta_eyebrow", "CTA — Eyebrow"],
	["cta_title", "CTA — Title"],
	["cta_body", "CTA — Body"],
	["cta_button", "CTA — Button"],
];

export function valuesFromHome(data) {
	const blocks = Object.fromEntries(
		(Array.isArray(data.content) ? data.content : [])
			.filter((block) => block && typeof block._type === "string")
			.map((block) => [block._type, block]),
	);
	const hero = { ...(data.hero || {}), ...(blocks["altix.hero"] || {}) };
	const wwd = { ...(data.what_we_do || {}), ...(blocks["altix.whatWeDo"] || {}) };
	const eco = { ...(data.ecosystem || {}), ...(blocks["altix.ecosystem"] || {}) };
	const proc = { ...(data.process || {}), ...(blocks["altix.process"] || {}) };
	const uw = { ...(data.underwriting || {}), ...(blocks["altix.underwriting"] || {}) };
	const rm = { ...(data.roadmap || {}), ...(blocks["altix.roadmap"] || {}) };
	const lead = { ...(data.leadership || {}), ...(blocks["altix.leadership"] || {}) };
	const cta = { ...(data.cta_band || {}), ...(blocks["altix.ctaBand"] || {}) };

	return {
		hero_eyebrow: hero.eyebrow,
		hero_headline_before: hero.headlineBefore,
		hero_headline_accent: hero.headlineAccent,
		hero_lead_strong: hero.leadStrong,
		hero_lead_rest: hero.leadRest,
		hero_primary_cta: hero.primaryCta,
		hero_secondary_cta: hero.secondaryCta,
		hero_badge_1: hero.badge1,
		hero_badge_2: hero.badge2,
		hero_badge_3: hero.badge3,
		hero_disclaimer: hero.disclaimer,
		wwd_eyebrow: wwd.eyebrow,
		wwd_title: wwd.title,
		wwd_body: wwd.body,
		eco_eyebrow: eco.eyebrow,
		eco_title: eco.title,
		eco_body: eco.body,
		proc_eyebrow: proc.eyebrow,
		proc_title: proc.title,
		proc_body: proc.body,
		uw_eyebrow: uw.eyebrow,
		uw_title: uw.title,
		uw_body: uw.body,
		rm_eyebrow: rm.eyebrow,
		rm_title: rm.title,
		rm_body: rm.body,
		lead_eyebrow: lead.eyebrow,
		lead_title: lead.title,
		lead_body: lead.body,
		lead_kicker: lead.kicker,
		lead_name: lead.name,
		lead_role: lead.role,
		lead_stat1_title: lead.stat1Title,
		lead_stat1_body: lead.stat1Body,
		lead_stat2_title: lead.stat2Title,
		lead_stat2_body: lead.stat2Body,
		lead_cta: lead.cta,
		cta_eyebrow: cta.eyebrow,
		cta_title: cta.title,
		cta_body: cta.body,
		cta_button: cta.button,
	};
}
