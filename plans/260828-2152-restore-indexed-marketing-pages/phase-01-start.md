---
title: "Phase 1: CMS allowlist and IA pages"
status: todo
priority: P1
effort: "8h"
dependencies: []
---

# Phase 1: CMS allowlist and IA pages

## Overview

Register the IA page slugs in `lix-api` with a shared JSON schema, then add matching Next.js routes on `zealous-nobel` that render fallback copy through `EditableText` so admin can publish without another deploy.

## Requirements

- Functional: every hub/stage/audience/company URL in the plan slug map has `app/**/page.tsx` and a CMS slug in `ALLOWED_PAGE_SLUGS`.
- Functional: `CmsProvider.pathnameToPageSlug` loads that slug on the route (same as `/` → `home`).
- Functional: visitor sees fallback copy if public CMS has not been published yet.
- Functional: ADMIN Edit mode seeds the row (`GET /admin/cms/pages/{slug}`) and can patch/publish via the existing toolbar.
- Non-functional: one inner-page schema reused across these pages; no page builder; no `POST /cms/pages`.
- Non-functional: copy from current homepage section fallbacks, not WordPress tokenization.

## Architecture

1. `lix-api` `PAGE_DEFAULTS`: add each IA slug with `{ eyebrow, title, lead, sections: [{title, body}, …], cta }`. Seed 3–6 section slots even if some start empty-string so `set_by_path` can fill them later. Leadership slug `about-leadership` also has `photoUrl`, `name`, `role`.
2. `ALLOWED_PAGE_SLUGS` stays `frozenset(PAGE_DEFAULTS.keys())`. Update `tests/test_cms_defaults.py`.
3. `MarketingPageShell` + one `InnerCmsPage` that binds `EditableText` to `pageSlug` + those paths. Thin `app/<route>/page.tsx` files pass the slug and fallbacks.
4. Extend `pathnameToPageSlug` with an explicit pathname → slug map (no catch-all that would collide with `/insights/[slug]` or `/login`).

Hubs: `/what-we-do` (links to three stages), `/how-it-works` (process steps as sections), `/who-we-work-with` (links to four audiences), `/expert-network`, `/about` (links to leadership).

## Related Code Files

- Modify: `lix-api/app/services/cms_defaults.py`
- Modify: `lix-api/tests/test_cms_defaults.py`
- Modify: `zealous-nobel/components/cms/CmsProvider.tsx` (`pathnameToPageSlug`)
- Create: `zealous-nobel/components/marketing/MarketingPageShell.tsx`
- Create: `zealous-nobel/components/marketing/InnerCmsPage.tsx`
- Create: `zealous-nobel/lib/marketing/path-slug.ts` (pathname → CMS slug, shared with provider)
- Create: `app/what-we-do/page.tsx` and the other IA routes listed in `plan.md` (except legal, which is phase 2)
- Reuse: existing EditToolbar / patch / publish; homepage section fallback copy

## Implementation Steps

1. Branch `feat/restore-indexed-marketing-pages` from `feat/marketing-cms-inline-edit` in both `lix-api` (if CMS is on that branch) and `zealous-nobel`.
2. Add IA `PAGE_DEFAULTS` entries; run CMS unit tests (`test_allowed_slugs` must include the new set).
3. Extract `MarketingPageShell` (Header, Footer, submit/access modals).
4. Implement `InnerCmsPage` with EditableText for eyebrow/title/lead/sections/cta.
5. Add Next.js pages; map pathnames in `path-slug.ts`.
6. Leadership page uses `about-leadership` plus `EditableImage` for `photoUrl` (`/assets/img/elke-biechele.webp` fallback).
7. `company-facts`: UEN 202607026R, ALTIX.EXCHANGE PTE. LTD., Singapore, `info@altix.exchange` — no invented metrics.
8. Smoke: open `/about` logged-out (fallback 200); login admin, Edit, change title, Publish, reload logged-out and see published title.

## Todo

- [ ] Add IA slugs + shared schema to `PAGE_DEFAULTS` and tests
- [ ] `pathnameToPageSlug` covers every IA route in this phase
- [ ] `MarketingPageShell` + `InnerCmsPage`
- [ ] Ship hub, stage, audience, company-facts, and leadership routes
- [ ] Unique Next metadata per page (can stay static; CMS does not need to own `<title>` in v1.1)
- [ ] Admin edit/publish works on `/about`

## Success Criteria

- [ ] Local GET of every phase-1 inventory URL is 200 with fallback copy
- [ ] `ALLOWED_PAGE_SLUGS` includes those slugs; unknown slug still 404s from CMS API
- [ ] Admin can publish `/about` through the existing toolbar
- [ ] No new CMS create-page endpoint

## Risk Assessment

If `pathnameToPageSlug` forgets a route, Edit toolbar loads no page state and patches fail. Keep the map next to the route list. Do not seed `published_content` as `{}` in a migration unless you also copy defaults — fallbacks already cover visitors.
