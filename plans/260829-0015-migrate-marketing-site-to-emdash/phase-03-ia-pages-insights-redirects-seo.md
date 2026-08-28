---
phase: 3
title: "IA pages, Insights, redirects, SEO"
status: pending
priority: P1
effort: "1.5d"
dependencies: [2]
---

# Phase 3: IA pages, Insights, redirects, SEO

## Overview

Ship every linked marketing URL as an EmDash page, Insights as `posts`, WordPress/Google 301s, sitemap. This is the work previously planned as homemade CMS allowlist expansion — do it in EmDash instead.

## Requirements

- Functional: all IA + legal URLs 200; Insights list + detail; editor can create/publish a post; redirects in seed; `/sitemap.xml` + `robots.txt`
- Non-functional: legal copy is scaffold only; no tokenization narrative

## Architecture

Two Astro routes cover almost all IA pages:

- `src/pages/[slug].astro` — lookup `getEmDashEntry("pages", { slug })` for the allowlisted slugs
- `src/pages/about/leadership/elke-biechele.astro` — leadership layout; load CMS entry slug `about-leadership` (not the URL path)
- `src/pages/insights/index.astro` — `getEmDashCollection("posts", { status: "published" })`
- `src/pages/insights/[slug].astro` — post body via EmDash `PortableText`

Shared inner template: eyebrow, title, lead, sections, cta from page data. Legal slugs (`privacy` `terms` `cookies` `disclosures` `security` `complaints`) use `title` `notice` `contact` (`info@altix.exchange`).

Redirects: put the map from `plan.md` in `.emdash/seed.json` `redirects` array (and/or `astro.config` / `_redirects` if EmDash seed redirects are request-time only — verify one `/about-us` → `/about` locally). Wildcard `/altixblogs/:slug` → `/insights/:slug`.

JSON-LD Organization from current `app/layout.tsx` stays on `Base.astro`.

Do **not** add `POST /cms/pages` to `lix-api`. Do **not** extend `ALLOWED_PAGE_SLUGS`.

## Related Code Files

- Create: `_emdash-scaffold/src/pages/[slug].astro`
- Create: `_emdash-scaffold/src/pages/about/leadership/elke-biechele.astro`
- Create: `_emdash-scaffold/src/pages/insights/index.astro`
- Create: `_emdash-scaffold/src/pages/insights/[slug].astro`
- Create: `_emdash-scaffold/src/pages/sitemap.xml.ts` (or EmDash built-in if present — use built-in if the template already has it)
- Modify: `_emdash-scaffold/.emdash/seed.json` (IA content + redirects)
- Reference copy: `plans/260828-2152-restore-indexed-marketing-pages/plan.md` slug + redirect tables

## Implementation Steps

1. Add a small slug allowlist in `[slug].astro`. Unknown slug → 404. New marketing URLs still need this PR + a seed stub. Insights posts do **not**. Do not let arbitrary CMS slugs become public URLs.
2. Seed each IA page with fallback English copy (eyebrow/title/lead + 1–2 sections). Legal: notice “This page is a temporary scaffold. Contact info@altix.exchange.”
3. Insights index: list published posts (title, excerpt, cover, date). Empty state OK.
4. Insights detail: title, date, cover, portable text. 404 if unpublished and visitor is not preview.
5. Seed redirects exactly as `plan.md`. Verify with `curl -I`.
6. `robots.txt` allow `/`, sitemap URL `https://altix.exchange/sitemap.xml`.
7. Footer: one Insights link; no Newsroom item.
8. Optional P2 (can slip to phase 4): replace dead WordPress paths in `lix-api` newsletter HTML with `/about`, `/how-it-works`, `/insights`, `/`.

## Todo

- [ ] `[slug].astro` allowlist + inner + legal templates
- [ ] Leadership page
- [ ] Insights list + detail from `posts`
- [ ] Seed redirects + curl verification
- [ ] sitemap.xml + robots.txt
- [ ] Footer Insights only (no Newsroom)

## Success Criteria

- [ ] curl every IA URL in `plan.md` → 200
- [ ] curl every redirect source → 301/308 then 200
- [ ] Admin publishes a new Insights post; it appears on `/insights` without a deploy. Editing copy on `/about` does not require a deploy. Adding `/brand-new-url` still requires a route PR.
- [ ] `/newsroom` lands on Insights
- [ ] No `NEXT_PUBLIC_API_URL` usage in the EmDash tree

## Risk Assessment

`[slug].astro` colliding with `insights` — put Insights under `src/pages/insights/` so it wins over dynamic slug.

Preview/draft leakage: public queries must use `status: "published"` except when EmDash preview cookie is set.

## Next Steps

Phase 4 promotes scaffold to app root, deploys Worker, points DNS.
