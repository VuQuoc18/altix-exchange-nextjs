# ALTIX inner pages from production build

Date: 2026-09-07  
Source: `/Users/admin/Downloads/ALTIX-Website-Production-Build`  
Site: EmDash marketing (`zealous-nobel`), Worker `altix-marketing`

## Goal

Replace thin scaffold copy on existing inner pages, and add the missing production-build pages, as EmDash `pages` entries. Editors change copy in `/_emdash/admin`. The current inner-page template, ALTIX navbar, homepage, and Insights posts stay as they are.

## Out of scope

- Homepage (`index.html` in the production build)
- Pixel-port of production HTML/CSS
- New Portable Text block types
- Working form backends (no email, no Netlify Forms, no CMS submissions)
- Porting `insights/*.html` articles or a separate `/newsroom` index (keep `/insights` + `posts`)
- Changing primary nav items or header CTAs (modal Institutional access; Submit a case → `https://platform.altix.exchange/`)
- Marketplace / `platform.altix.exchange`

## Page inventory

### Replace copy (already routed in `[slug].astro`)

`what-we-do`, `how-it-works`, `who-we-work-with`, `expert-network`, `about`, `case-readiness`, `litigation-funding`, `case-administration`, `claimants-and-businesses`, `law-firms`, `funding-participants`, `forensic-experts`, `company-facts`, `privacy`, `terms`, `cookies`, `disclosures`, `security`, `complaints`

### Add routes + CMS entries

`global-asset-recovery`, `forensic-intelligence`, `contact`, `submit-a-matter`, `request-institutional-access`, `thank-you`, `editorial-policy`

### Dedicated template, refresh copy from HTML

`/about/leadership/elke-biechele` — keep `src/pages/about/leadership/elke-biechele.astro`. Update the `about-leadership` (or equivalent) CMS entry from `about/leadership/elke-biechele.html`. Do not invent a second leadership URL.

### Redirects (not new pages)

- `/newsroom` → `/insights` (already present)
- `/contact-us` → `/contact` (change from current `/` redirect so the new contact page is reachable)
- Remove `/contact` → `/`

## Rendering

Keep `src/pages/[slug].astro`:

1. Allowlist check (extend with the seven new slugs).
2. `getEmDashEntry("pages", slug)` + `Astro.cache.set(cacheHint)`.
3. Missing entry → 404 rewrite.
4. Legal slugs keep the legal layout (notice banner + mailto). Update notice/copy from production legal HTML; do not drop the “temporary scaffold” banner until production legal text no longer contains “Production note” / “Pre-launch legal task”. If production legal HTML is still provisional, keep a visible notice using that production wording, not the old generic scaffold sentence.
5. Other slugs: hero (`eyebrow`, `title`, `lead`) → optional `content` (MarketingBlocks) → `sections` card grid → `CtaBand`.

Form slugs (`contact`, `submit-a-matter`, `request-institutional-access`, `expert-network`): after the CMS body, render a **display-only** Astro form matching the production field set. `onsubmit` preventDefault. No file inputs. Keep the production warning not to send privileged evidence. `thank-you` is a content page only (no redirect-after-submit, because nothing submits).

Do not put raw HTML forms inside Portable Text.

## Content mapping

Source of truth for wording: the matching `*.html` file’s `<main>` (not header/footer).

| Production HTML | CMS field |
| --- | --- |
| eyebrow | `eyebrow` |
| `h1` (strip `<em>` to plain text) | `title` |
| hero lead (`p.hero-lead` or first lead paragraph) | `lead` |
| remaining headings + paragraphs that are not cards | `content` Portable Text (paragraphs, headings, lists; `marketing.features` / `marketing.faq` only when the section is clearly a feature list or FAQ) |
| `.card-grid` / numbered cards | `sections[]` `{ title, body }` |
| closing CTA band | existing `cta_band` / CtaBand fields |
| `<title>` + meta description | EmDash SEO fields when the collection supports `seo` |

Internal links in copy must use site paths without `.html` (`./case-readiness.html` → `/case-readiness`).

`submit-a-matter` in body copy may link to `/submit-a-matter`. Header button “Submit a case” stays on `platform.altix.exchange`.

## Footer

Do not change primary nav. Add discovery links in footer Company (or equivalent) for pages that are otherwise only reachable by URL: at least `Contact`, and `Editorial policy` if not linked elsewhere. Do not add a RisikoTek column.

## Data rollout

`seed.json` / `.emdash/seed.json` must include the new entries and updated copy so empty databases match.

Production D1 is already seeded, so seed files alone will not update live entries. After local verification, upsert published entries with EmDash CLI (`emdash content create` / `update`) against the running site, then deploy the Worker for allowlist/redirect/template changes.

## Errors and empty states

- Unknown slug → existing 404 page.
- Allowlisted slug with no CMS entry → 404 (do not render an empty hero).
- Display-only form: stay on the same page; no success navigation (users can open `/thank-you` from a link in copy if needed).

## Verification

- Each listed inner URL returns 200 with production `h1`/`lead` (or the mapped title/lead).
- `/`, `/insights`, `/about/leadership/elke-biechele` still work.
- `/platform`, `/solutions`, and other non-allowlist paths stay 404.
- `/contact` is 200, not 301 to `/`.
- Submitting a form does not send a network request and does not change CMS data.
- Admin can edit title/lead/sections on one sample page and see it on the next request.

## Success criteria

An editor can change inner-page copy in EmDash admin. Public inner pages match production-build wording inside the current ALTIX chrome. Homepage and Insights are unchanged. Forms are visible and inert.
