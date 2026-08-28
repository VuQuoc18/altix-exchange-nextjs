import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

const BASE_URL = "https://altix.exchange";

const ALLOWLISTED_SLUGS = [
	"/what-we-do",
	"/how-it-works",
	"/who-we-work-with",
	"/expert-network",
	"/about",
	"/case-readiness",
	"/litigation-funding",
	"/case-administration",
	"/claimants-and-businesses",
	"/law-firms",
	"/funding-participants",
	"/forensic-experts",
	"/company-facts",
	"/privacy",
	"/terms",
	"/cookies",
	"/disclosures",
	"/security",
	"/complaints",
];

const STATIC_ROUTES = [
	"/",
	...ALLOWLISTED_SLUGS,
	"/about/leadership/elke-biechele",
	"/insights",
];

export const GET: APIRoute = async () => {
	const urls = new Set<string>();

	for (const route of STATIC_ROUTES) {
		const url = route === "/" ? `${BASE_URL}/` : `${BASE_URL}${route}`;
		urls.add(url);
	}

	try {
		const { entries: posts } = await getEmDashCollection("posts", {
			status: "published",
		});

		if (Array.isArray(posts)) {
			for (const post of posts) {
				const status = post.data?.status || (post as any).status;
				if (status === "published" || !status) {
					const slug = (post as any).slug || post.data?.slug || post.id;
					if (slug) {
						urls.add(`${BASE_URL}/insights/${slug}`);
					}
				}
			}
		}
	} catch (error) {
		console.error("Error fetching posts for sitemap:", error);
	}

	const urlElements = Array.from(urls)
		.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
		.join("\n");

	const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlElements}\n</urlset>`;

	return new Response(xmlContent, {
		headers: {
			"Content-Type": "application/xml",
		},
	});
};
