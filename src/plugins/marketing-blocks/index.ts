/**
 * Marketing blocks plugin (inline, template-local).
 *
 * Registers every section an editor can drop into a page's "Page content"
 * field. Each block declares a Block Kit form, so editors fill in labelled
 * inputs instead of editing JSON.
 *
 * Authoring conventions (keep these when adding blocks):
 *
 * - Labels are plain English written for non-technical editors. Text inputs
 *   have no help-text slot, so hints go in the label ("(optional)",
 *   "(one per line)") and real examples go in `placeholder` ("e.g. …").
 * - Every block ends with a "Hide this section" toggle (see `HIDE`).
 *   MarketingBlocks.astro skips hidden blocks, so editors can park a section
 *   without deleting its content.
 * - Images use `media_picker`, which opens the Media Library. The stored
 *   value is the asset URL string, so it is value-compatible with the old
 *   `text_input` URL fields and no content migration is needed.
 * - Block Kit has no nested object element, so CTA { label, url } pairs are
 *   flattened to sibling fields (primaryCtaLabel + primaryCtaUrl).
 * - Lists of strings are a single multiline field split on newlines at
 *   render time (Checklist, Audience cards → points, Image + text → bullets).
 * - Numbering (01, 02, …) for cards and steps is generated at render time.
 *
 * Renderers live in src/components/blocks/** and are dispatched from
 * src/components/MarketingBlocks.astro.
 */

import { definePlugin } from "emdash";
import type { PluginDefinition } from "emdash";

// ── Shared field helpers ────────────────────────────────────────────────

type Field = Record<string, unknown>;

const text = (action_id: string, label: string, placeholder?: string): Field => ({
	type: "text_input",
	action_id,
	label,
	...(placeholder ? { placeholder } : {}),
});

const textarea = (action_id: string, label: string, placeholder?: string): Field => ({
	...text(action_id, label, placeholder),
	multiline: true,
});

const image = (action_id: string, label: string): Field => ({
	type: "media_picker",
	action_id,
	label,
	mime_type_filter: "image/",
	placeholder: "Choose from Media Library",
});

const toggle = (action_id: string, label: string, description?: string): Field => ({
	type: "toggle",
	action_id,
	label,
	...(description ? { description } : {}),
});

const select = (action_id: string, label: string, options: Array<[string, string]>, initial?: string): Field => ({
	type: "select",
	action_id,
	label,
	options: options.map(([value, optLabel]) => ({ label: optLabel, value })),
	...(initial ? { initial_value: initial } : {}),
});

const repeater = (
	action_id: string,
	label: string,
	item_label: string,
	fields: Field[],
	opts: { min?: number; max?: number } = {},
): Field => ({
	type: "repeater",
	action_id,
	label,
	item_label,
	fields,
	min_items: opts.min ?? 1,
	...(opts.max ? { max_items: opts.max } : {}),
});

/** Small label above a section title — used by almost every block. */
const EYEBROW = text("eyebrow", "Small label above title (optional)", "e.g. Preparation");
const HIDE = toggle("hidden", "Hide this section", "Keeps the content saved but does not show it on the website.");

const COLUMNS = select(
	"columns",
	"Columns on desktop",
	[
		["2", "2 columns"],
		["3", "3 columns"],
		["4", "4 columns"],
	],
	"3",
);

const FORM_TYPES: Array<[string, string]> = [
	["matter-submission", "Submit a matter (case intake)"],
	["institutional-access", "Request institutional access"],
	["general-contact", "General contact"],
	["professional-network", "Professional network application"],
];

type BlockConfig = {
	type: string;
	label: string;
	category: string;
	description: string;
	fields: Field[];
};

// ── Page sections: building blocks for any inner page ──────────────────

const PAGE = "Page sections";

const pageSections: BlockConfig[] = [
	{
		type: "altix.intro",
		label: "Intro",
		category: PAGE,
		description: "Small label, title and a short paragraph. Put it directly above text to give it a heading.",
		fields: [
			EYEBROW,
			text("title", "Title", "e.g. Our mission."),
			textarea("subtitle", "Intro paragraph (optional)"),
			HIDE,
		],
	},
	{
		type: "altix.cardGrid",
		label: "Card grid",
		category: PAGE,
		description: "Cards with a title, short text and an optional link. Numbered 01, 02, 03… automatically.",
		fields: [
			EYEBROW,
			text("title", "Title", "e.g. Core services."),
			textarea("subtitle", "Intro paragraph (optional)"),
			toggle("numbered", "Show numbers on cards (01, 02, 03…)"),
			repeater("cards", "Cards", "Card", [
				text("title", "Card title", "e.g. Case Readiness"),
				textarea("description", "Card text"),
				text("linkText", "Link text (optional)", "e.g. Explore →"),
				text("linkUrl", "Link goes to (optional)", "e.g. /case-readiness"),
			]),
			HIDE,
		],
	},
	{
		type: "altix.checklist",
		label: "Checklist",
		category: PAGE,
		description: "A heading with a two-column grid of ticked bullet points.",
		fields: [
			EYEBROW,
			text("title", "Title", "e.g. What Case Readiness may include."),
			textarea("subtitle", "Intro paragraph (optional)"),
			textarea(
				"items",
				"Checklist items (one per line)",
				"Verified identity and claimant authority\nChronology and evidence index\nLoss and damages schedule",
			),
			HIDE,
		],
	},
	{
		type: "altix.steps",
		label: "Numbered steps",
		category: PAGE,
		description: "A step-by-step process. Steps are numbered automatically in the order you list them.",
		fields: [
			EYEBROW,
			text("title", "Title", "e.g. Nine stages. One controlled process."),
			textarea("subtitle", "Intro paragraph (optional)"),
			repeater("steps", "Steps", "Step", [
				text("title", "Step title", "e.g. Submit the opportunity"),
				textarea("description", "Step description"),
			]),
			HIDE,
		],
	},
	{
		type: "altix.faq",
		label: "FAQ",
		category: PAGE,
		description: "Questions that expand to show the answer when clicked.",
		fields: [
			EYEBROW,
			text("title", "Title (optional)", "e.g. Frequently asked questions"),
			textarea("subtitle", "Intro paragraph (optional)"),
			toggle("openFirst", "Show the first answer already open"),
			repeater("items", "Questions", "Question", [
				text("question", "Question", "e.g. What is ALTIX Exchange?"),
				textarea("answer", "Answer"),
			]),
			HIDE,
		],
	},
	{
		type: "altix.form",
		label: "Form",
		category: PAGE,
		description: "Embed one of the website's forms (contact, submit a matter, …).",
		fields: [
			EYEBROW,
			text("title", "Title", "e.g. Apply to be considered."),
			select("formType", "Which form?", FORM_TYPES, "general-contact"),
			textarea("formNote", "Note shown with the form (optional)", "e.g. Do not submit privileged material through this form."),
			text("anchor", "Jump-link name (optional)", "e.g. apply → lets buttons link to /page#apply"),
			HIDE,
		],
	},
	{
		type: "altix.person",
		label: "Person",
		category: PAGE,
		description: "Photo, name, role and a link to their profile.",
		fields: [
			EYEBROW,
			text("title", "Section title (optional)", "e.g. Leadership."),
			textarea("subtitle", "Intro paragraph (optional)"),
			image("photo", "Photo"),
			text("name", "Name", "e.g. Elke Biechele"),
			text("role", "Role", "e.g. Founder & CEO"),
			text("linkText", "Link text (optional)", "e.g. View profile →"),
			text("linkUrl", "Profile link (optional)", "e.g. /about/leadership/elke-biechele"),
			HIDE,
		],
	},
	{
		type: "altix.callout",
		label: "Callout",
		category: PAGE,
		description: "A highlighted box for an important note. Put it directly below text to keep it in the same section.",
		fields: [
			text("label", "Bold lead-in (optional)", "e.g. Pre-launch legal task:"),
			textarea("text", "Message"),
			HIDE,
		],
	},
	{
		type: "altix.notice",
		label: "Notice",
		category: PAGE,
		description: "A friendly message for when there is nothing to show yet.",
		fields: [
			text("title", "Message title", "e.g. No newsroom entries yet."),
			textarea("description", "Details (optional)"),
			HIDE,
		],
	},
];

// ── Homepage sections ──────────────────────────────────────────────────

const HOME = "Homepage";

const homepageSections: BlockConfig[] = [
	{
		type: "altix.hero",
		label: "Homepage hero",
		category: HOME,
		description: "Big headline with highlighted words, two buttons, three badges and small print.",
		fields: [
			EYEBROW,
			text("headlineBefore", "Headline — first part", "e.g. Preparing qualified legal claims for"),
			text("headlineAccent", "Headline — highlighted words", "e.g. professional capital"),
			textarea("leadStrong", "Intro — bold first sentence"),
			textarea("leadRest", "Intro — rest of the paragraph"),
			text("primaryCta", "Main button text", "e.g. Submit a case"),
			text("secondaryCta", "Second button text", "e.g. How it works"),
			text("badge1", "Badge 1 (optional)"),
			text("badge2", "Badge 2 (optional)"),
			text("badge3", "Badge 3 (optional)"),
			textarea("disclaimer", "Small print (optional)"),
			HIDE,
		],
	},
	{
		type: "altix.whatWeDo",
		label: "Three service cards",
		category: HOME,
		description: "Title and paragraph with up to three service cards.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("body", "Paragraph"),
			repeater(
				"cards",
				"Cards",
				"Card",
				[
					text("title", "Card title"),
					textarea("description", "Card text"),
					text("linkText", "Link text (optional)", "e.g. Learn more →"),
					text("badge", "Badge (optional)", "e.g. Stage 1"),
				],
				{ max: 3 },
			),
			HIDE,
		],
	},
	{
		type: "altix.ecosystem",
		label: "Audience cards",
		category: HOME,
		description: "Who we work with — up to four audience cards with bullet points.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("body", "Paragraph"),
			repeater(
				"items",
				"Audience cards",
				"Audience",
				[
					text("title", "Audience", "e.g. Law firms"),
					textarea("description", "Card text"),
					text("linkText", "Link text (optional)"),
					textarea("points", "Bullet points (one per line)"),
				],
				{ max: 4 },
			),
			HIDE,
		],
	},
	{
		type: "altix.process",
		label: "Process timeline",
		category: HOME,
		description: "Homepage process timeline with numbered steps.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("body", "Paragraph"),
			text("milestoneLabel", "Label above the timeline (optional)", "e.g. Key milestones"),
			repeater(
				"steps",
				"Steps",
				"Step",
				[text("title", "Step title"), textarea("desc", "Step description")],
				{ max: 12 },
			),
			HIDE,
		],
	},
	{
		type: "altix.underwriting",
		label: "Assessment criteria",
		category: HOME,
		description: "What we assess — a grid of criteria with optional badges.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("body", "Paragraph"),
			repeater(
				"items",
				"Criteria",
				"Criterion",
				[text("title", "Criterion"), textarea("description", "Explanation"), text("badge", "Badge (optional)")],
				{ max: 8 },
			),
			HIDE,
		],
	},
	{
		type: "altix.roadmap",
		label: "Roadmap",
		category: HOME,
		description: "Current platform status and upcoming items.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("body", "Paragraph"),
			repeater(
				"items",
				"Roadmap items",
				"Item",
				[text("status", "Status", "e.g. Live / In development"), text("title", "Item title"), textarea("description", "Description")],
				{ max: 6 },
			),
			HIDE,
		],
	},
	{
		type: "altix.leadership",
		label: "Founder profile",
		category: HOME,
		description: "Founder biography with photo, two highlight stats and a button.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("body", "Paragraph"),
			text("kicker", "Small label above name (optional)", "e.g. Founder"),
			text("name", "Name"),
			text("role", "Role"),
			image("photoUrl", "Photo"),
			text("stat1Title", "Highlight 1 — headline", "e.g. 25+ years"),
			textarea("stat1Body", "Highlight 1 — text"),
			text("stat2Title", "Highlight 2 — headline"),
			textarea("stat2Body", "Highlight 2 — text"),
			text("cta", "Button text (optional)", "e.g. View profile"),
			HIDE,
		],
	},
	{
		type: "altix.insights",
		label: "Latest insights",
		category: HOME,
		description: "Shows the newest published articles automatically. Nothing to fill in — just place it.",
		fields: [HIDE],
	},
	{
		type: "altix.ctaBand",
		label: "Call-to-action band",
		category: HOME,
		description: "Dark band with a title, short text and one button. Works on any page.",
		fields: [
			EYEBROW,
			text("title", "Title", "e.g. Start with a structured initial review."),
			textarea("body", "Text"),
			text("button", "Button text", "e.g. Submit a case"),
			text("url", "Button goes to (optional)", "e.g. /submit-a-matter"),
			HIDE,
		],
	},
];

// ── Images & media ─────────────────────────────────────────────────────

const MEDIA = "Images & media";

const mediaSections: BlockConfig[] = [
	{
		type: "altix.splitMedia",
		label: "Image + text",
		category: MEDIA,
		description: "Image on one side, title, text, bullet points and buttons on the other.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("body", "Text"),
			image("imageUrl", "Image"),
			text("imageAlt", "Describe the image (for screen readers)", "e.g. Team reviewing case documents"),
			select("imagePosition", "Image side", [
				["right", "Right"],
				["left", "Left"],
			], "right"),
			textarea("bullets", "Bullet points (optional, one per line)"),
			text("primaryCtaLabel", "Main button text (optional)"),
			text("primaryCtaUrl", "Main button goes to", "e.g. /submit-a-matter"),
			text("secondaryCtaLabel", "Second button text (optional)"),
			text("secondaryCtaUrl", "Second button goes to"),
			HIDE,
		],
	},
	{
		type: "altix.cards",
		label: "Cards with images",
		category: MEDIA,
		description: "Card grid where each card has a cover image, badge and link.",
		fields: [
			EYEBROW,
			text("title", "Title"),
			textarea("subtitle", "Intro paragraph (optional)"),
			COLUMNS,
			repeater("cards", "Cards", "Card", [
				image("imageUrl", "Cover image"),
				text("badge", "Badge (optional)", "e.g. Step 01"),
				text("title", "Card title"),
				textarea("description", "Card text"),
				text("linkText", "Link text (optional)"),
				text("linkUrl", "Link goes to (optional)"),
			]),
			HIDE,
		],
	},
	{
		type: "altix.gallery",
		label: "Image gallery",
		category: MEDIA,
		description: "Grid of photos that open full-screen when clicked.",
		fields: [
			EYEBROW,
			text("headline", "Title (optional)"),
			textarea("subheadline", "Intro paragraph (optional)"),
			COLUMNS,
			select("aspectRatio", "Photo shape", [
				["4:3", "Standard (4:3)"],
				["square", "Square (1:1)"],
				["16:9", "Widescreen (16:9)"],
				["auto", "Keep original shape"],
			], "4:3"),
			repeater("images", "Photos", "Photo", [
				image("url", "Photo"),
				text("caption", "Caption (optional)"),
				text("tag", "Tag (optional)", "e.g. Event"),
				text("alt", "Describe the photo (for screen readers)"),
			]),
			HIDE,
		],
	},
	{
		type: "altix.carousel",
		label: "Image carousel",
		category: MEDIA,
		description: "Swipeable slideshow with captions.",
		fields: [
			EYEBROW,
			text("headline", "Title (optional)"),
			textarea("subheadline", "Intro paragraph (optional)"),
			toggle("autoPlay", "Play slides automatically"),
			repeater("images", "Slides", "Slide", [
				image("url", "Image"),
				text("caption", "Caption (optional)"),
				text("alt", "Describe the image (for screen readers)"),
				text("linkUrl", "Slide links to (optional)"),
			]),
			HIDE,
		],
	},
	{
		type: "altix.beforeAfter",
		label: "Before / after slider",
		category: MEDIA,
		description: "Two images with a draggable divider to compare them.",
		fields: [
			EYEBROW,
			text("headline", "Title (optional)"),
			textarea("subheadline", "Intro paragraph (optional)"),
			image("beforeImage", "Before image"),
			text("beforeLabel", "Before label (optional)", "Before"),
			image("afterImage", "After image"),
			text("afterLabel", "After label (optional)", "After"),
			HIDE,
		],
	},
];

const definition = {
	id: "marketing-blocks",
	version: "0.2.0",
	admin: {
		portableTextBlocks: [...pageSections, ...homepageSections, ...mediaSections],
	},
} as unknown as PluginDefinition;

/** Block types this plugin renders. MarketingBlocks.astro must map each one. */
export const BLOCK_TYPES = [...pageSections, ...homepageSections, ...mediaSections].map((b) => b.type);

export function createPlugin() {
	return definePlugin(definition);
}

export default createPlugin;
