---
title: "Phase 2: Legal CMS scaffolds, redirects, sitemap"
status: todo
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Legal CMS scaffolds, redirects, sitemap

## Overview

Add six legal routes with CMS-editable scaffold copy, 301 Google/WordPress URLs onto the IA, merge Newsroom into Insights, and publish sitemap/robots.

## Requirements

- Functional: `/privacy`, `/terms`, `/cookies`, `/disclosures`, `/security`, `/complaints` return 200.
- Functional: each page is CMS slug of the same name with `{ title, notice, contact }`; defaults say temporary/forthcoming and `info@altix.exchange`.
- Functional: redirect map in `plan.md` is implemented as permanent Next.js redirects.
- Functional: `/newsroom` 301 → `/insights`; footer drops Newsroom (keep one Insights link).
- Functional: `/sitemap.xml` and `/robots.txt` return 200 and list public IA + insights URLs (not `/login`).

## Architecture

`LegalScaffold` binds three `EditableText` paths. Do not draft GDPR/PDPA clauses. Admin can replace the notice later via Edit/Publish.

Redirects: `next.config.js` `async redirects()`, `permanent: true`. `/altixblogs/:path*` → `/insights/:path*`. `/en-us` and `/en-us/` → `/`.

Sitemap: `app/sitemap.ts` static paths from the slug map plus `/` and `/insights`. Optional blog slug fetch; if it fails, still emit static paths.

Robots: `app/robots.ts`, sitemap `https://altix.exchange/sitemap.xml`.

## Related Code Files

- Modify: `lix-api/app/services/cms_defaults.py` (six legal slugs)
- Modify: `lix-api/tests/test_cms_defaults.py`
- Modify: `zealous-nobel/lib/marketing/path-slug.ts` and `CmsProvider` map
- Create: `components/marketing/LegalScaffold.tsx`
- Create: `app/privacy/page.tsx` and the other five legal routes
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Modify: `next.config.js`
- Modify: `components/Footer.tsx`

## Implementation Steps

1. Add legal `PAGE_DEFAULTS` (title + temporary notice + contact email).
2. Render six routes with `LegalScaffold`; visible copy must include temporary/forthcoming.
3. Footer: remove Newsroom; keep Insights.
4. Add the full redirect table from `plan.md`.
5. Add robots + sitemap.
6. Verify `/about-us`, `/altixblogs`, `/newsroom`, `/en-us/` return 308/301.

## Todo

- [ ] Six legal CMS slugs + scaffold pages
- [ ] Footer: drop Newsroom
- [ ] Permanent redirects for every row in the plan redirect map
- [ ] `robots.txt` + `sitemap.xml`

## Success Criteria

- [ ] Footer Legal links all 200
- [ ] `/newsroom` redirects to `/insights`
- [ ] `/about-us` redirects to `/about` and `/about` is 200
- [ ] `/altixblogs/fake-investment-apps-clone-platform-fraud-recovery` redirects to `/insights/...`
- [ ] Admin can edit `/privacy` notice via CMS after seed
- [ ] `/sitemap.xml` and `/robots.txt` are 200

## Risk Assessment

Next.js permanent redirects may be 308; treat 301 or 308 as success. Preserve blog slugs on `/altixblogs/:slug`. Legal notice must not read as an in-force policy until counsel replaces it in CMS.
