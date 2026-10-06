---
title: "Phase 3: Outbound links and live verify"
status: todo
priority: P2
effort: "3h"
dependencies: [2]
---

# Phase 3: Outbound links and live verify

## Overview

Stop `lix-api` / `lix-next` from emitting dead WordPress URLs in newsletter HTML, then verify the production host `https://altix.exchange` (or preview) the way a user and Googlebot would.

## Requirements

- Functional: default/example newsletter markup uses `/about`, `/how-it-works`, `/insights`, and `/` (or mailto) instead of `/about-us`, `/how-altix-works`, `/altixblogs`, `/contact-us`.
- Functional: newsletter placeholder in admin UI suggests `https://altix.exchange/insights/...`.
- Non-functional: do not rewrite historical analytics rows in `backfill_newsletter_history.py` unless the script is still used to send live mail; prefer leaving historical URLs (redirects will catch them) and only change templates/examples that generate new mail.
- Verification: browser or curl against the deployed marketing host, not only localhost.
- Verification: one CMS edit/publish round-trip on a new IA page (e.g. `/about`) on preview or production.

## Architecture

Redirects already cover old links in previously sent email. This phase is so new mail and the admin preview do not keep teaching Google the old graph.

Repos:

- `lix-api`: `app/templates/email/weekly_newsletter.html`, example dicts in `app/services/email_service.py`
- `lix-next`: `src/components/dashboards/NewsletterPreview.tsx`, placeholder in `src/components/dashboards/NewsletterTab.tsx`

Do not add `/privacy-policy` pages to `lix-next`; that app is `platform.altix.exchange`.

## Related Code Files

- Modify: `/Volumes/Extend/HomeMigrated/Project/risikotek/lix-api/app/templates/email/weekly_newsletter.html`
- Modify: `/Volumes/Extend/HomeMigrated/Project/risikotek/lix-api/app/services/email_service.py` (example URLs only)
- Modify: `/Volumes/Extend/HomeMigrated/Project/risikotek/lix-next/src/components/dashboards/NewsletterPreview.tsx`
- Modify: `/Volumes/Extend/HomeMigrated/Project/risikotek/lix-next/src/components/dashboards/NewsletterTab.tsx`
- Leave: `lix-api/scripts/backfill_newsletter_history.py` historical URLs (redirects handle them)

## Implementation Steps

1. Replace WordPress paths in `weekly_newsletter.html` and `NewsletterPreview.tsx` footer/CTA:
   - `/altixblogs` → `/insights`
   - `/about-us` → `/about`
   - `/how-altix-works` → `/how-it-works`
   - `/contact-us` → `https://altix.exchange/` or `mailto:info@altix.exchange`
2. Change NewsletterTab placeholder from `https://altix.exchange/altixblogs/...` to `https://altix.exchange/insights/...`.
3. Update example article URLs in `email_service.py` docstring/example to `/insights/{same-slug}` where that slug already 200s; otherwise point at `/insights`.
4. After marketing deploy: GET the redirect map and page inventory on `https://altix.exchange`.
5. Browser-check: home → each header link; footer legal; Google-style entry `/about-us` and `/altixblogs`.
6. Confirm `/insights/fake-investment-apps-clone-platform-fraud-recovery` still 200 after the `/altixblogs/:slug` redirect.
7. Admin: Edit `/about` (or `/privacy`), publish, reload logged-out and confirm CMS copy, not only fallback.

## Todo

- [ ] Newsletter HTML/preview uses new IA URLs
- [ ] Admin placeholder uses `/insights/`
- [ ] Example URLs in `email_service.py` updated
- [ ] Production/preview curl matrix for inventory + redirect map
- [ ] Browser pass of header, footer, and two old Google URLs
- [ ] Admin publish round-trip on one new CMS page

## Success Criteria

- [ ] Repo search for `altix.exchange/about-us`, `how-altix-works`, `altixblogs`, `contact-us` in templates/previews (not historical backfill) is empty
- [ ] Live `https://altix.exchange/about-us` redirects to a 200 `/about`
- [ ] Live `https://altix.exchange/sitemap.xml` is 200
- [ ] No remaining 404 from header/footer on production
- [ ] Admin edit/publish on one new page is visible to a logged-out visitor

## Risk Assessment

Verifying only localhost misses Vercel rewrite issues. Preview deploy is acceptable if production deploy is blocked; say so in the completion note. Search Console recrawl is optional ops, not a code gate.
