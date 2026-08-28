---
title: "Migrate marketing site to EmDash"
description: "Replace the Next.js marketing site and homemade lix-api CMS with an EmDash Astro theme on Cloudflare, absorbing the indexed-URL restore work."
status: pending
priority: P1
effort: "5d"
branch: feat/emdash-marketing
tags: [feature, frontend, infra, marketing, cms, emdash, cloudflare]
blockedBy: []
blocks: [260828-2152-restore-indexed-marketing-pages]
created: 2026-08-29
---

# Migrate marketing site to EmDash

## Overview

`https://altix.exchange` is the Vercel Next.js app in this repo. Insights + inline edit talk to homemade CMS in `lix-api`. Header/footer already link ~20 IA routes that 404.

This plan **replaces Next.js with EmDash** (`@emdash-cms/template-marketing-cloudflare`): Astro theme, D1+R2, editor-owned pages/posts. It **supersedes** `260828-2152-restore-indexed-marketing-pages` — those routes and WordPress 301s ship here, not via expanding `ALLOWED_PAGE_SLUGS`.

Marketplace stays at `https://platform.altix.exchange`. Do not change `lix-next`. Do not grow `lix-api` CMS.

## Cross-Plan Dependencies

| Relationship | Plan | Status |
|-------------|------|--------|
| Supersedes / blocks | `260828-2152-restore-indexed-marketing-pages` | cancelled |

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Marketing site runs on EmDash + Cloudflare Workers | P1 |
| 2 | Editor publishes Insights posts and existing-page copy without a deploy | P1 |
| 3 | Every header/footer/homepage-card href returns 200 | P1 |
| 4 | Google/WordPress URLs 301 to the new IA | P1 |
| 5 | Homepage look + React islands (hero stage, modals, mobile nav) preserved | P1 |
| 6 | `platform.altix.exchange` untouched | P1 |

## Architecture

```
Visitor → Cloudflare Worker (EmDash + Astro SSR)
            ├─ D1  content (pages, posts, redirects, menus)
            ├─ R2  media
            └─ React islands: Header, InteractiveCaseStage, 2 modals

Editor  → /_emdash/admin (passkey)  — not /login + lix-api JWT
```

In-place rewrite on `feat/emdash-marketing`. Scaffold Cloudflare marketing template into `_emdash-scaffold/`, port CSS/assets/components, then replace Next.js root files. Keep `public/assets/` (logo, Elke photo).

**Content model**

| Collection | Slug | Role |
|---|---|---|
| `pages` | `home` | Structured homepage fields (from `PAGE_DEFAULTS["home"]`) |
| `pages` | IA + legal slugs below | Inner-page schema |
| `posts` | Insights articles | title, excerpt, cover, portableText body, SEO |

Inner page fields: `eyebrow`, `title`, `lead`, `sections[] {title, body}`, `cta`. Leadership adds `photoUrl`, `name`, `role`. Legal uses `title`, `notice`, `contact`.

**Islands (locked):** do not split Header / Hero Access CTA / Access modal into separate React trees — they share open-state today via `app/page.tsx`.

| Island | Directive | Contains |
|---|---|---|
| `SiteChrome.tsx` | `client:load` | Header (mobile nav + scroll) + `InstitutionalAccessModal`. Exposes `window` event `altix:open-access` so Astro/Hero can open the same modal. |
| `HeroIsland.tsx` | `client:load` | Current Hero (mouse parallax + primary/secondary CTAs) + `InteractiveCaseStage`. Secondary CTA dispatches `altix:open-access` (or calls into SiteChrome). Primary CTA stays `https://platform.altix.exchange/`. |

Do **not** port `SubmitMatterModal` — dead code: `isSubmitOpen` is never set. Every live Submit CTA already goes to platform.

Other sections (WhatWeDo → CtaBand, Footer, UtilityBar): Astro + existing CSS. No Framer Motion there.

**Forms:** no intake backend. Do not wire `lix-api`. Header / Hero / CtaBand "Submit a case" stay `https://platform.altix.exchange/`.

**New public URLs vs copy:** Insights posts and copy on **already-routed** pages = editor only, no deploy. A **new** marketing URL still needs a PR (allowlist in `[slug].astro` + seed stub). That is intentional — not a free page builder.

**Leadership:** public URL `/about/leadership/elke-biechele` is a dedicated Astro file. CMS page slug is `about-leadership` (not the path).

## Locked copy / IA

Do not recreate WordPress "tokenize the claim" narrative. Legal pages are scaffolds; contact `info@altix.exchange`. `/newsroom` 301 → `/insights`.

IA routes (must 200): `/what-we-do` `/how-it-works` `/who-we-work-with` `/expert-network` `/about` `/about/leadership/elke-biechele` `/case-readiness` `/litigation-funding` `/case-administration` `/claimants-and-businesses` `/law-firms` `/funding-participants` `/forensic-experts` `/company-facts` `/privacy` `/terms` `/cookies` `/disclosures` `/security` `/complaints` plus `/` `/insights` `/insights/[slug]`.

Redirects: `/en-us` → `/`; `/about-us` → `/about`; `/how-altix-works` → `/how-it-works`; `/how-altix-works-for-claimants` → `/claimants-and-businesses`; `/how-altix-works-for-lawyers` → `/law-firms`; `/how-altix-works-for-investors` → `/funding-participants`; `/become-a-partner` + `/expert-panel` → `/expert-network`; `/contact-us` → `/`; `/altixblogs` → `/insights`; `/altixblogs/:slug` → `/insights/:slug`; `/privacy-policy` → `/privacy`; `/terms-of-service` → `/terms`; `/newsroom` → `/insights`.

## Non-goals

- Marketplace / `lix-next` / `platform.altix.exchange`
- Expanding `lix-api` `ALLOWED_PAGE_SLUGS` or homemade Edit toolbar
- Deleting `lix-api` CMS endpoints in this plan (leave dormant)
- Real intake/API for modals
- Full counsel-approved legal policies
- Visual click-to-edit overlay if React 19 island bugs appear — admin panel is the editor of record
- Porting `SubmitMatterModal` (unwired in current Next.js)
- Admin-invented public URLs without a route PR

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Bootstrap EmDash Cloudflare theme](./phase-01-start.md) | Pending |
| 2 | [Port homepage chrome and islands](./phase-02-port-homepage-chrome-and-islands.md) | Pending |
| 3 | [IA pages, Insights, redirects, SEO](./phase-03-ia-pages-insights-redirects-seo.md) | Pending |
| 4 | [Cloudflare cutover and verify](./phase-04-cloudflare-cutover-and-verify.md) | Pending |

## Dependencies

- Cloudflare account with Workers + D1 + R2
- EmDash marketing Cloudflare template: `npm create astro@latest -- --template @emdash-cms/template-marketing-cloudflare`
- Docs: https://docs.emdashcms.com/themes/overview/ https://docs.emdashcms.com/deployment/cloudflare/ https://docs.emdashcms.com/themes/seed-files/
- Current copy source: `lix-api/app/services/cms_defaults.py` (`PAGE_DEFAULTS`)
- Design source: `app/globals.css`, `components/*.tsx`, `public/assets/`

## Success Criteria

- [ ] `npm run dev` serves homepage matching current brand (colors, serif, logo)
- [ ] `/_emdash/admin` can publish an Insights post and edit copy on an existing IA page without a deploy
- [ ] Every IA URL in Locked copy returns 200
- [ ] Redirect map returns 301/308 then 200
- [ ] `/sitemap.xml` lists live public URLs
- [ ] Hero stage + Access modal + mobile nav work
- [ ] CTA to `platform.altix.exchange` unchanged
- [ ] Production on Cloudflare; Vercel no longer serves `altix.exchange`

## Risks

- EmDash pre-1.0 (D1 schema churn). Pin package version; do not upgrade mid-cutover.
- In-place rewrite will not `next build`. Keep `main` deployable on Vercel until phase 4 DNS cutover.
- Seed applies only on empty DB. Wrong first boot = wipe or manual CLI, not silent re-seed.
- Merging EmDash onto the Vercel production branch before the Worker owns `altix.exchange` breaks `next build` and burns rollback. Tag `pre-emdash-next` first; domain on Worker; then promote root.
- If `altix.exchange` nameservers are not Cloudflare, Workers “custom domain” is not enough — confirm DNS host in phase 4 before cutover.
- Newsletter HTML in `lix-api`/`lix-next` may still emit old WordPress paths (P2 leftover; optional in phase 4).

<!-- slug: migrate-marketing-site-to-emdash -->
