import fs from "fs";
import path from "path";

const SOURCE_DIR = "/Users/admin/Downloads/ALTIX-Website-Production-Build";
const SEED_PATH = path.resolve("./seed/seed.json");

// Helper to strip HTML tags
function stripHtml(html) {
	if (!html) return "";
	return html.replace(/<[^>]+>/g, "").trim();
}

// Helper to clean up text with entities
function cleanText(text) {
	if (!text) return "";
	return text
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&euro;/g, "€")
		.trim();
}

function parseHtmlFile(filePath, slug) {
	const html = fs.readFileSync(filePath, "utf8");

	// 1. Meta / SEO
	const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
	let metaTitle = titleMatch ? cleanText(titleMatch[1]) : "";
	let pageTitle = metaTitle.split("|")[0].split("—")[0].trim();
	if (pageTitle.startsWith("ALTIX Exchange:")) {
		pageTitle = pageTitle.replace("ALTIX Exchange:", "").trim();
	}

	const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
	const metaDesc = descMatch ? cleanText(descMatch[1]) : "";

	// 2. Hero
	const heroMatch = html.match(/<section class=["']hero["']>([\s\S]*?)<\/section>/i);
	let hero = {
		eyebrow: "",
		h1: pageTitle,
		lead: metaDesc,
		buttonLabel: "",
		buttonHref: "",
		microcopy: "",
	};

	if (heroMatch) {
		const hContent = heroMatch[1];
		const eyebrowMatch = hContent.match(/class=["']eyebrow[^"']*["']>([\s\S]*?)<\/span>/i);
		if (eyebrowMatch) hero.eyebrow = cleanText(eyebrowMatch[1]);

		const h1Match = hContent.match(/<h1>([\s\S]*?)<\/h1>/i);
		if (h1Match) hero.h1 = cleanText(h1Match[1]);

		const leadMatch = hContent.match(/class=["']hero-lead["']>([\s\S]*?)<\/p>/i);
		if (leadMatch) hero.lead = cleanText(leadMatch[1]);

		const btnMatch = hContent.match(/class=["']button["'][^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/i);
		if (btnMatch) {
			hero.buttonHref = btnMatch[1].replace("./", "/").replace(".html", "");
			hero.buttonLabel = cleanText(btnMatch[2].replace(/<[^>]+>/g, ""));
		}

		const microMatch = hContent.match(/class=["']microcopy["']>([\s\S]*?)<\/p>/i);
		if (microMatch) hero.microcopy = cleanText(microMatch[1]);
	}

	// 3. Sections
	const sections = [];
	const sectionRegex = /<section class=["'](section[^"']*)["'][^>]*>([\s\S]*?)<\/section>/gi;
	let secMatch;

	while ((secMatch = sectionRegex.exec(html)) !== null) {
		const secClass = secMatch[1];
		const secBody = secMatch[2];

		const secEyebrowMatch = secBody.match(/class=["']eyebrow[^"']*["']>([\s\S]*?)<\/span>/i);
		const secEyebrow = secEyebrowMatch ? cleanText(secEyebrowMatch[1]) : "";

		const h2Match = secBody.match(/<h2>([\s\S]*?)<\/h2>/i);
		const secTitle = h2Match ? cleanText(h2Match[1]) : "";

		const pMatch = secBody.match(/<div class=["']section-head["']>[\s\S]*?<p>([\s\S]*?)<\/p>/i);
		const secSubhead = pMatch ? cleanText(pMatch[1]) : "";

		// A. Check for Cards
		const cardRegex = /<article class=["']card["']>([\s\S]*?)<\/article>/gi;
		const cards = [];
		let cMatch;
		while ((cMatch = cardRegex.exec(secBody)) !== null) {
			const cb = cMatch[1];
			const no = cb.match(/class=["']card-no["']>([\s\S]*?)<\/span>/i)?.[1]?.trim();
			const title = cb.match(/<h3>([\s\S]*?)<\/h3>/i)?.[1]?.trim();
			const desc = cb.match(/<p>([\s\S]*?)<\/p>/i)?.[1]?.trim();
			const linkTag = cb.match(/<a class=["']text-link["'] href=["']([^"']*)["']>([\s\S]*?)<\/a>/i);
			cards.push({
				no: cleanText(no),
				title: cleanText(title),
				description: cleanText(desc),
				linkText: linkTag ? cleanText(linkTag[2]) : "",
				linkUrl: linkTag ? linkTag[1].replace("./", "/").replace(".html", "") : "",
			});
		}

		// B. Check for Check-grid
		const checkGridMatch = secBody.match(/<ul class=["']check-grid["']>([\s\S]*?)<\/ul>/i);
		const checkItems = [];
		if (checkGridMatch) {
			const liRegex = /<li>([\s\S]*?)<\/li>/gi;
			let li;
			while ((li = liRegex.exec(checkGridMatch[1])) !== null) {
				checkItems.push(cleanText(li[1]));
			}
		}

		// C. Check for Process list
		const processMatch = secBody.match(/<ol class=["']process[^"']*["']>([\s\S]*?)<\/ol>/i);
		const processSteps = [];
		if (processMatch) {
			const liRegex = /<li>([\s\S]*?)<\/li>/gi;
			let li;
			while ((li = liRegex.exec(processMatch[1])) !== null) {
				const spanMatch = li[1].match(/<span>([\s\S]*?)<\/span>/i);
				const h3Match = li[1].match(/<h3>([\s\S]*?)<\/h3>/i);
				const pMatch = li[1].match(/<p>([\s\S]*?)<\/p>/i);
				processSteps.push({
					no: spanMatch ? cleanText(spanMatch[1]) : "",
					title: h3Match ? cleanText(h3Match[1]) : cleanText(li[1].replace(/<[^>]+>/g, "")),
					desc: pMatch ? cleanText(pMatch[1]) : "",
				});
			}
		}

		// D. Check for FAQ / Details
		const faqMatch = secBody.match(/<div class=["']faq["']>([\s\S]*?)<\/div>/i);
		const faqItems = [];
		if (faqMatch) {
			const dRegex = /<details[^>]*>[\s\S]*?<summary>([\s\S]*?)<\/summary>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi;
			let d;
			while ((d = dRegex.exec(faqMatch[1])) !== null) {
				faqItems.push({
					question: cleanText(d[1]),
					answer: cleanText(d[2]),
				});
			}
		}

		// E. Check for Legal Copy
		const legalCopyMatch = secBody.match(/<div class=["']legal-copy["']>([\s\S]*?)<\/div>/i);
		let legalItems = [];
		let callout = "";
		if (legalCopyMatch) {
			const lHtml = legalCopyMatch[1];
			const cMatch = lHtml.match(/<p class=["']callout["']>([\s\S]*?)<\/p>/i);
			if (cMatch) {
				callout = cleanText(cMatch[1]);
			}
			const blocks = lHtml.split(/<h3>/i);
			for (let i = 0; i < blocks.length; i++) {
				const b = blocks[i];
				if (i === 0) {
					const pList = b.match(/<p(?: class=["'](?!callout)[^"']*["'])?>([\s\S]*?)<\/p>/gi);
					if (pList) {
						for (const p of pList) {
							const text = cleanText(p);
							if (text) legalItems.push({ heading: "", body: text });
						}
					}
				} else {
					const parts = b.split(/<\/h3>/i);
					const heading = cleanText(parts[0]);
					const rest = parts[1] || "";
					const pList = rest.match(/<p(?: class=["'](?!callout)[^"']*["'])?>([\s\S]*?)<\/p>/gi);
					const bodies = pList ? pList.map((p) => cleanText(p)).join("\n\n") : cleanText(rest);
					legalItems.push({ heading, body: bodies });
				}
			}
		}

		// F. Check for Form
		const formMatch = secBody.match(/<form[^>]*name=["']([^"']*)["'][^>]*>([\s\S]*?)<\/form>/i);
		let formType = "";
		let formNote = "";
		if (formMatch) {
			formType = formMatch[1];
			const noteMatch = secBody.match(/<p class=["']form-note["']>([\s\S]*?)<\/p>/i);
			if (noteMatch) formNote = cleanText(noteMatch[1]);
		}

		// G. Check for Leadership / Elke Biechele
		const leadMatch = secBody.match(/<div class=["']leadership-feature["']>([\s\S]*?)<\/div>/i);
		let leadership = null;
		if (leadMatch) {
			const lb = leadMatch[1];
			const h3 = lb.match(/<h3>([\s\S]*?)<\/h3>/i)?.[1];
			const p = lb.match(/<p>([\s\S]*?)<\/p>/i)?.[1];
			leadership = {
				title: cleanText(h3),
				description: cleanText(p),
				linkUrl: "/about/leadership/elke-biechele",
			};
		}

		// H. Check for Empty State (Newsroom)
		const emptyMatch = secBody.match(/<div class=["']empty-state["']>([\s\S]*?)<\/div>/i);
		let emptyState = null;
		if (emptyMatch) {
			const eb = emptyMatch[1];
			const h2 = eb.match(/<h2>([\s\S]*?)<\/h2>/i)?.[1];
			const p = eb.match(/<p>([\s\S]*?)<\/p>/i)?.[1];
			emptyState = {
				title: cleanText(h2),
				description: cleanText(p),
			};
		}

		// Determine section type
		let type = "standard";
		if (formType) type = "form";
		else if (faqItems.length > 0) type = "faq";
		else if (legalItems.length > 0) type = "legal";
		else if (processSteps.length > 0) type = "process";
		else if (cards.length > 0) type = "cards";
		else if (checkItems.length > 0) type = "check_grid";
		else if (leadership) type = "leadership";
		else if (emptyState) type = "empty_state";

		sections.push({
			type,
			eyebrow: secEyebrow,
			title: secTitle,
			subtitle: secSubhead,
			cards: cards.length > 0 ? cards : undefined,
			checkItems: checkItems.length > 0 ? checkItems : undefined,
			processSteps: processSteps.length > 0 ? processSteps : undefined,
			faqItems: faqItems.length > 0 ? faqItems : undefined,
			legalItems: legalItems.length > 0 ? legalItems : undefined,
			callout: callout || undefined,
			formType: formType || undefined,
			formNote: formNote || undefined,
			leadership: leadership || undefined,
			emptyState: emptyState || undefined,
		});
	}

	return {
		id: slug,
		slug,
		status: "published",
		data: {
			title: pageTitle,
			eyebrow: hero.eyebrow,
			lead: hero.lead,
			hero_cta_label: hero.buttonLabel || undefined,
			hero_cta_url: hero.buttonHref || undefined,
			microcopy: hero.microcopy || undefined,
			sections,
		},
	};
}

// Parse insight article
function parseInsightArticle(filePath, slug) {
	const html = fs.readFileSync(filePath, "utf8");

	const titleMatch = html.match(/<h1>([\s\S]*?)<\/h1>/i);
	const title = titleMatch ? cleanText(titleMatch[1]) : slug;

	const leadMatch = html.match(/class=["']hero-lead["']>([\s\S]*?)<\/p>/i);
	const excerpt = leadMatch ? cleanText(leadMatch[1]) : "";

	const metaMatch = html.match(/class=["']article-meta["']>([\s\S]*?)<\/div>/i);
	const meta = metaMatch ? cleanText(metaMatch[1]) : "";

	// Extract body
	const bodyMatch = html.match(/<div class=["']container article-body["']>([\s\S]*?)<\/article>/i);
	const sections = [];
	let disclaimer = "";

	if (bodyMatch) {
		const bHtml = bodyMatch[1];
		const discMatch = bHtml.match(/<div class=["']article-disclaimer["']>([\s\S]*?)<\/div>/i);
		if (discMatch) {
			disclaimer = cleanText(discMatch[1]);
		}

		// Split by h2
		const parts = bHtml.replace(/<div class=["']article-disclaimer["']>[\s\S]*?<\/div>/i, "").split(/<h2>/i);
		for (let i = 1; i < parts.length; i++) {
			const sub = parts[i].split(/<\/h2>/i);
			const h2 = cleanText(sub[0]);
			const pList = sub[1].match(/<p>([\s\S]*?)<\/p>/gi);
			const content = pList ? pList.map((p) => cleanText(p)).join("\n\n") : cleanText(sub[1]);
			sections.push({ title: h2, body: content });
		}
	}

	// Build Portable Text
	const portableText = [];
	for (const s of sections) {
		portableText.push({
			_type: "block",
			style: "h2",
			children: [{ _type: "span", text: s.title }],
		});
		portableText.push({
			_type: "block",
			style: "normal",
			children: [{ _type: "span", text: s.body }],
		});
	}

	return {
		id: slug,
		slug,
		status: "published",
		data: {
			title,
			excerpt,
			published_at: "2026-08-26T00:00:00.000Z",
			content: portableText,
			disclaimer,
			sections,
		},
	};
}

async function run() {
	console.log("Reading existing seed.json...");
	const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));

	// Slugs to extract
	const pageFiles = [
		{ file: "what-we-do.html", slug: "what-we-do" },
		{ file: "how-it-works.html", slug: "how-it-works" },
		{ file: "who-we-work-with.html", slug: "who-we-work-with" },
		{ file: "expert-network.html", slug: "expert-network" },
		{ file: "about.html", slug: "about" },
		{ file: "case-readiness.html", slug: "case-readiness" },
		{ file: "litigation-funding.html", slug: "litigation-funding" },
		{ file: "case-administration.html", slug: "case-administration" },
		{ file: "claimants-and-businesses.html", slug: "claimants-and-businesses" },
		{ file: "law-firms.html", slug: "law-firms" },
		{ file: "funding-participants.html", slug: "funding-participants" },
		{ file: "forensic-experts.html", slug: "forensic-experts" },
		{ file: "global-asset-recovery.html", slug: "global-asset-recovery" },
		{ file: "forensic-intelligence.html", slug: "forensic-intelligence" },
		{ file: "company-facts.html", slug: "company-facts" },
		{ file: "newsroom.html", slug: "newsroom" },
		{ file: "contact.html", slug: "contact" },
		{ file: "submit-a-matter.html", slug: "submit-a-matter" },
		{ file: "request-institutional-access.html", slug: "request-institutional-access" },
		{ file: "thank-you.html", slug: "thank-you" },
		{ file: "privacy.html", slug: "privacy" },
		{ file: "terms.html", slug: "terms" },
		{ file: "cookies.html", slug: "cookies" },
		{ file: "disclosures.html", slug: "disclosures" },
		{ file: "security.html", slug: "security" },
		{ file: "complaints.html", slug: "complaints" },
		{ file: "editorial-policy.html", slug: "editorial-policy" },
	];

	// Keep existing home page from seed
	const existingHome = seed.content.pages.find((p) => p.slug === "home");
	const existingLeadership = seed.content.pages.find((p) => p.slug === "about-leadership");

	const newPages = [existingHome];

	for (const item of pageFiles) {
		const filePath = path.join(SOURCE_DIR, item.file);
		if (fs.existsSync(filePath)) {
			console.log(`Extracting page: ${item.slug} from ${item.file}...`);
			const parsed = parseHtmlFile(filePath, item.slug);
			newPages.push(parsed);
		} else {
			console.warn(`File not found: ${filePath}`);
		}
	}

	if (existingLeadership) {
		newPages.push(existingLeadership);
	}

	// Extract insights
	const insightFiles = [
		{ file: "insights/what-is-litigation-finance.html", slug: "what-is-litigation-finance" },
		{ file: "insights/collectability-matters.html", slug: "collectability-matters" },
		{ file: "insights/what-makes-a-claim-fundable.html", slug: "what-makes-a-claim-fundable" },
	];

	const newPosts = [];
	for (const item of insightFiles) {
		const filePath = path.join(SOURCE_DIR, item.file);
		if (fs.existsSync(filePath)) {
			console.log(`Extracting insight post: ${item.slug}...`);
			const parsed = parseInsightArticle(filePath, item.slug);
			newPosts.push(parsed);
		}
	}

	// Update seed
	seed.content.pages = newPages;
	seed.content.posts = newPosts;

	// Fix redirects: remove /contact -> / and /newsroom -> /insights
	seed.redirects = seed.redirects.filter(
		(r) => r.source !== "/contact" && r.source !== "/contact-us" && r.source !== "/newsroom"
	);

	fs.writeFileSync(SEED_PATH, JSON.stringify(seed, null, "\t") + "\n");
	console.log(`Updated seed.json with ${newPages.length} pages and ${newPosts.length} posts!`);
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
