---
phase: 1
title: "Bootstrap EmDash Cloudflare theme"
status: pending
priority: P1
effort: "1d"
dependencies: []
---

# Phase 1: Bootstrap EmDash Cloudflare theme

## Overview

Create `feat/emdash-marketing`. Scaffold `@emdash-cms/template-marketing-cloudflare` beside the Next.js app, lock content collections in `.emdash/seed.json`, prove admin + empty home render locally. Do not delete Next.js yet.

## Requirements

- Functional: local EmDash admin wizard completes; D1 (local) + seed collections exist; `pages`/`posts` match the locked model in `plan.md`
- Non-functional: pin `emdash` version in `package.json`; `nodejs_compat` in `wrangler.jsonc`

## Architecture

Scaffold into `_emdash-scaffold/` so `main`/current Vercel deploy stays intact. Port assets later. Seed is the contract: collections, menus, redirects (redirects can be empty until phase 3 but collection slugs for IA pages must exist).

Home is one `pages` entry `slug=home` with nested object fields matching `PAGE_DEFAULTS["home"]` keys (`hero`, `whatWeDo`, `ecosystem`, `process`, `underwriting`, `roadmap`, `leadership`, `ctaBand`). Prefer JSON/object fields over flattening 80+ columns (D1 ~100 column limit).

## Related Code Files

- Create: `_emdash-scaffold/` (Astro + EmDash from template)
- Create: `_emdash-scaffold/.emdash/seed.json`
- Create: `_emdash-scaffold/wrangler.jsonc` (template; fill real D1/R2 IDs in phase 4)
- Keep: entire Next.js tree until phase 4

## Implementation Steps

1. Branch `feat/emdash-marketing` from current `feat/marketing-cms-inline-edit` (or `main` if that is what production tracks — confirm `git log` / Vercel production branch first).
2. Scaffold:
   ```bash
   npm create astro@latest _emdash-scaffold -- --template @emdash-cms/template-marketing-cloudflare --no-git --install
   ```
3. Copy `public/assets/` into `_emdash-scaffold/public/assets/`.
4. Replace template seed collections with ALTIX model: `pages` + `posts`. Add seed **content** for `home` using copy from `lix-api/app/services/cms_defaults.py`. Add placeholder pages for every IA slug in `plan.md` (title + lead only is enough). Leadership CMS slug is `about-leadership` (URL is `/about/leadership/elke-biechele`, not the slug).
5. Seed `settings.title` = `ALTIX Exchange`. Primary menu items: What we do, How it works, Who we work with, Professional Network, Insights, About — same hrefs as `components/Header.tsx`.
6. `cd _emdash-scaffold && npm run dev`. Open `http://localhost:4321/_emdash/admin`, complete wizard, **include seed content**.
7. Confirm `GET /` 200 (even if still template layout) and admin can open `home` + one Insights post.

## Todo

- [ ] Branch `feat/emdash-marketing`
- [ ] Scaffold Cloudflare marketing template into `_emdash-scaffold/`
- [ ] Pin emdash version; copy `public/assets/`
- [ ] Write `.emdash/seed.json` with pages/posts + home copy + IA slug stubs
- [ ] Wizard + seed applied; admin opens home and posts

## Success Criteria

- [ ] `_emdash-scaffold` boots without Next.js
- [ ] Admin lists `home` and every IA slug as pages
- [ ] `posts` collection exists for Insights
- [ ] Next.js app in repo root still starts (`npm run dev` on port 3000) so Vercel rollback remains possible

## Risk Assessment

Scaffolding into repo root too early bricks Vercel. Keep dual trees until phase 4.

If seed field count on `home` approaches D1 limits, keep homepage as **one JSON field** `blocks` (object) instead of one SQL column per string.

## Next Steps

Phase 2 ports layout/CSS/islands onto this scaffold.
