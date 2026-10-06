import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const SEED_PATH = path.resolve("./seed/seed.json");
const SQL_PATH = path.resolve("./sync_db.sql");

const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function generateUlid() {
	let now = Date.now();
	let timeStr = "";
	for (let i = 9; i >= 0; i--) {
		timeStr = ENCODING[now % 32] + timeStr;
		now = Math.floor(now / 32);
	}
	let randStr = "";
	for (let i = 0; i < 16; i++) {
		randStr += ENCODING[Math.floor(Math.random() * 32)];
	}
	return timeStr + randStr;
}

function escapeSql(str) {
	if (str === null || str === undefined) return "NULL";
	return "'" + String(str).replace(/'/g, "''") + "'";
}

async function run() {
	console.log("Fetching existing pages and posts from remote D1...");
	let existingPages = [];
	let existingPosts = [];

	try {
		const pagesOut = execSync(
			'npx wrangler d1 execute altix-marketing --remote --command "SELECT id, slug FROM ec_pages;" --json',
			{ encoding: "utf8" }
		);
		const pagesJson = JSON.parse(pagesOut);
		existingPages = pagesJson[0]?.results || [];
	} catch (err) {
		console.warn("Could not fetch remote pages:", err.message);
	}

	try {
		const postsOut = execSync(
			'npx wrangler d1 execute altix-marketing --remote --command "SELECT id, slug FROM ec_posts;" --json',
			{ encoding: "utf8" }
		);
		const postsJson = JSON.parse(postsOut);
		existingPosts = postsJson[0]?.results || [];
	} catch (err) {
		console.warn("Could not fetch remote posts:", err.message);
	}

	const pageIdMap = new Map(existingPages.map((p) => [p.slug, p.id]));
	const postIdMap = new Map(existingPosts.map((p) => [p.slug, p.id]));

	const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
	const sqlStatements = [];

	const now = new Date().toISOString();

	// 1. Process Pages
	console.log(`Processing ${seed.content.pages.length} pages...`);
	for (const page of seed.content.pages) {
		const slug = page.slug;
		// Skip home page as home page is already deeply configured in D1
		if (slug === "home") {
			continue;
		}

		let entryId = pageIdMap.get(slug);
		if (!entryId) {
			entryId = generateUlid();
			pageIdMap.set(slug, entryId);
		}

		const revisionId = generateUlid();
		const data = page.data || {};
		const title = data.title || slug;
		const eyebrow = data.eyebrow || null;
		const lead = data.lead || null;
		const sections = data.sections ? JSON.stringify(data.sections) : null;
		const ctaBand = data.cta_band ? JSON.stringify(data.cta_band) : null;
		const content = data.content ? JSON.stringify(data.content) : null;

		// Revision entry
		const revisionDataJson = JSON.stringify(data);
		sqlStatements.push(`
INSERT INTO "revisions" ("id", "collection", "entry_id", "data", "author_id", "created_at")
VALUES (${escapeSql(revisionId)}, 'pages', ${escapeSql(entryId)}, ${escapeSql(revisionDataJson)}, NULL, ${escapeSql(now)});
`);

		// UPSERT ec_pages
		sqlStatements.push(`
INSERT INTO "ec_pages" (
	"id", "slug", "status", "created_at", "updated_at", "published_at",
	"version", "live_revision_id", "draft_revision_id", "locale", "translation_group",
	"title", "eyebrow", "lead", "sections", "cta_band", "content"
) VALUES (
	${escapeSql(entryId)}, ${escapeSql(slug)}, 'published', ${escapeSql(now)}, ${escapeSql(now)}, ${escapeSql(now)},
	1, ${escapeSql(revisionId)}, ${escapeSql(revisionId)}, 'en', ${escapeSql(entryId)},
	${escapeSql(title)}, ${escapeSql(eyebrow)}, ${escapeSql(lead)}, ${escapeSql(sections)}, ${escapeSql(ctaBand)}, ${escapeSql(content)}
)
ON CONFLICT("id") DO UPDATE SET
	"title" = ${escapeSql(title)},
	"eyebrow" = ${escapeSql(eyebrow)},
	"lead" = ${escapeSql(lead)},
	"sections" = ${escapeSql(sections)},
	"cta_band" = ${escapeSql(ctaBand)},
	"content" = ${escapeSql(content)},
	"updated_at" = ${escapeSql(now)},
	"live_revision_id" = ${escapeSql(revisionId)},
	"draft_revision_id" = ${escapeSql(revisionId)};
`);
	}

	// 2. Process Posts
	console.log(`Processing ${seed.content.posts.length} posts...`);
	for (const post of seed.content.posts) {
		const slug = post.slug;
		let entryId = postIdMap.get(slug);
		if (!entryId) {
			entryId = generateUlid();
			postIdMap.set(slug, entryId);
		}

		const revisionId = generateUlid();
		const data = post.data || {};
		const title = data.title || slug;
		const excerpt = data.excerpt || null;
		const content = data.content ? JSON.stringify(data.content) : null;

		const revisionDataJson = JSON.stringify(data);
		sqlStatements.push(`
INSERT INTO "revisions" ("id", "collection", "entry_id", "data", "author_id", "created_at")
VALUES (${escapeSql(revisionId)}, 'posts', ${escapeSql(entryId)}, ${escapeSql(revisionDataJson)}, NULL, ${escapeSql(now)});
`);

		sqlStatements.push(`
INSERT INTO "ec_posts" (
	"id", "slug", "status", "created_at", "updated_at", "published_at",
	"version", "live_revision_id", "draft_revision_id", "locale", "translation_group",
	"title", "excerpt", "content"
) VALUES (
	${escapeSql(entryId)}, ${escapeSql(slug)}, 'published', ${escapeSql(now)}, ${escapeSql(now)}, ${escapeSql(now)},
	1, ${escapeSql(revisionId)}, ${escapeSql(revisionId)}, 'en', ${escapeSql(entryId)},
	${escapeSql(title)}, ${escapeSql(excerpt)}, ${escapeSql(content)}
)
ON CONFLICT("id") DO UPDATE SET
	"title" = ${escapeSql(title)},
	"excerpt" = ${escapeSql(excerpt)},
	"content" = ${escapeSql(content)},
	"updated_at" = ${escapeSql(now)},
	"live_revision_id" = ${escapeSql(revisionId)},
	"draft_revision_id" = ${escapeSql(revisionId)};
`);
	}

	fs.writeFileSync(SQL_PATH, sqlStatements.join("\n"));
	console.log(`Generated SQL file at ${SQL_PATH} with ${sqlStatements.length} statements.`);
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
