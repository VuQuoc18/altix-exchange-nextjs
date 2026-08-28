---
phase: 2
title: "Port homepage chrome and islands"
status: pending
priority: P1
effort: "1.5d"
dependencies: [1]
---

# Phase 2: Port homepage chrome and islands

## Overview

Replace the marketing template look with ALTIX chrome: `globals.css`, Header/Footer/UtilityBar, homepage sections. Two React islands only (`SiteChrome`, `HeroIsland`). Homepage copy from EmDash `pages/home`, not `lix-api`. Do not port `SubmitMatterModal`.

## Requirements

- Functional: `/` matches current brand; mobile nav; Institutional Access modal from Header **and** Hero; InteractiveCaseStage + hero parallax; Submit CTAs to `https://platform.altix.exchange/`
- Non-functional: no `next/link` / `next/image`; no `lib/cms/*`; no Framer Motion on static sections; no `SubmitMatterModal`

## Architecture

Enable `@astrojs/react`. Islands are locked in `plan.md`:

| Island | Directive | Contains |
|---|---|---|
| `src/components/react/SiteChrome.tsx` | `client:load` | Header + `InstitutionalAccessModal`. Listens for `window` event `altix:open-access`. |
| `src/components/react/HeroIsland.tsx` | `client:load` | Hero (parallax + CTAs) + `InteractiveCaseStage`. Access button: `window.dispatchEvent(new CustomEvent("altix:open-access"))`. Submit: platform URL. |

Do not make Header, Hero, and Modal three separate islands — they cannot share React state.

`src/layouts/Base.astro` = UtilityBar + `SiteChrome` + slot + Footer. `src/pages/index.astro` queries home and passes data into Astro sections + `HeroIsland`.

Read `getEmDashEntry` signature from current EmDash docs at cook time (do not assume `{ slug }` vs positional args).

Port WhatWeDo, Ecosystem, Process, Underwriting, Roadmap, Leadership, CtaBand as `.astro`. Convert `Link` → `<a>`. CtaBand submit stays platform URL.

Drop: `components/cms/*`, `app/login`, `CmsProvider`, `EditToolbar`, `SubmitMatterModal`. Editors use `/_emdash/admin`.

## Related Code Files

- Create: `_emdash-scaffold/src/layouts/Base.astro`
- Create: `_emdash-scaffold/src/pages/index.astro`
- Create: `_emdash-scaffold/src/components/*.astro` (static sections)
- Create: `_emdash-scaffold/src/components/react/SiteChrome.tsx`
- Create: `_emdash-scaffold/src/components/react/HeroIsland.tsx`
- Port: `app/globals.css` → `_emdash-scaffold/src/styles/global.css`
- Port: `components/Footer.tsx` → Footer.astro
- Port: `components/UtilityBar.tsx`
- Port: `components/Header.tsx`, `components/hero/InteractiveCaseStage.tsx`, `components/modals/InstitutionalAccessModal.tsx`, `components/HeroSection.tsx` into the two islands
- Delete (phase 4): Next.js `app/`, `components/cms/`

## Implementation Steps

1. Add `@astrojs/react` + `react` + `react-dom` + `lucide-react`. Add `framer-motion` only if HeroIsland is visually broken without it (current Hero uses it). Prefer CSS on static sections.
2. Copy `app/globals.css` and Tailwind tokens from `tailwind.config.js`. Confirm `.button` / `.container` / `.eyebrow` still apply.
3. Implement `SiteChrome`: Header nav hrefs + Institutional Access button set modal open. `window.addEventListener("altix:open-access", ...)`.
4. Implement `HeroIsland`: port Hero + InteractiveCaseStage. Primary CTA → platform. Secondary → dispatch `altix:open-access`.
5. Port Footer from `components/Footer.tsx`. Newsroom item → `/insights` (no `/newsroom` nav item).
6. Port remaining sections as Astro; bind to `home` CMS fields with seed fallbacks.
7. Visual check desktop + mobile `/` against Next.js on :3000.

## Todo

- [ ] React integration + SiteChrome + HeroIsland (event bus for Access modal)
- [ ] Base layout + global CSS + assets
- [ ] Footer/UtilityBar + static sections bound to `pages/home`
- [ ] No SubmitMatterModal; platform Submit CTAs unchanged

## Success Criteria

- [ ] Side-by-side with current Next.js homepage: same sections, logo, palette, disclaimer, hero glow/stage
- [ ] Header Access and Hero Access both open the same modal
- [ ] Mobile menu opens/closes
- [ ] No network calls to `lix-api` from the homepage
- [ ] No full-page React SPA

## Risk Assessment

Astro + React 19 islands may break EmDash visual editing overlays. Ignore overlay; admin panel is enough.

If `getEmDashEntry` field shapes differ from seed (nested JSON vs flat), adapt Astro props here — do not flatten SQL columns.

## Next Steps

Phase 3 adds the 404 IA routes, Insights, redirects, sitemap.
