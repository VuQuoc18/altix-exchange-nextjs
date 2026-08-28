---
phase: 4
title: "Cloudflare cutover and verify"
status: pending
priority: P1
effort: "1d"
dependencies: [3]
---

# Phase 4: Cloudflare cutover and verify

## Overview

Promote the EmDash tree to repo root, deploy Workers + D1 + R2, attach `altix.exchange`, verify the acceptance list, keep Vercel as rollback until DNS is confirmed.

## Requirements

- Functional: production `https://altix.exchange` is EmDash; admin works; redirects work on the live host
- Non-functional: zero downtime preferred (Workers custom domain swap); do not touch `platform.altix.exchange`

## Architecture

1. Cloudflare: `wrangler d1 create altix-marketing` + R2 bucket `altix-marketing-media`. Deploy **from `_emdash-scaffold/`** first (empty D1, wizard on workers.dev).
2. Tag `pre-emdash-next` on the last Next.js commit. Confirm DNS host. Point `altix.exchange` at the Worker; verify 200s.
3. Only then move `_emdash-scaffold/*` to repo root; git-rm Next.js leftovers. Keep `plans/`. Merge to the Vercel production branch after the Worker owns the domain.
4. Rollback: restore DNS to Vercel + tag `pre-emdash-next`. Do not delete the Vercel project.

Confirm DNS host first: if nameservers are not Cloudflare, Workers custom-domain UI is not sufficient — set the DNS records the Worker docs require (or move NS).

`lix-api` CMS endpoints stay. Do not migrate blog rows unless Insights already has published posts worth keeping — if yes, one-shot copy into EmDash posts via admin/CLI; if empty, skip.

Newsletter WordPress paths in `lix-api`/`lix-next` are P2 leftover: fix in this phase if cheap, otherwise leave explicit debt.

## Related Code Files

- Modify: repo root `package.json`, `astro.config.mjs`, `wrangler.jsonc`
- Delete: `app/`, `next.config.js`, `next-env.d.ts`, `components/` (Next), `lib/cms/`
- Modify (optional P2): `lix-api` newsletter templates — WordPress URLs → new IA
- Do not modify: `lix-next` marketplace routes

## Implementation Steps

1. Confirm Cloudflare login: `wrangler whoami`.
2. Create D1 + R2; fill `wrangler.jsonc` bindings `DB` + `MEDIA` per https://docs.emdashcms.com/deployment/cloudflare/
3. `npm run build` in scaffold; `npx wrangler deploy`. Record workers.dev URL.
4. Open `/_emdash/admin` on workers.dev, finish wizard if needed, create passkey admin. Publish `home` if still draft.
5. Spot-check `/`, `/insights`, `/about`, `/privacy`, one redirect `/about-us`.
6. Tag `pre-emdash-next`. Promote scaffold to repo root on `feat/emdash-marketing` but **do not merge to the Vercel production branch** until step 8 is green.
7. Custom domain in Cloudflare (after confirming nameservers / DNS host). Wait until `curl -I https://altix.exchange/about` is 200 from the Worker.
8. Detach `altix.exchange` from Vercel.
9. Full URL checklist from `plan.md` against production.
10. Optional P2: newsletter path fix in `lix-api` / `lix-next` placeholders.

## Todo

- [ ] `pre-emdash-next` tag exists; Worker owns domain before Vercel production branch loses Next.js
- [ ] DNS host confirmed (Cloudflare NS or equivalent records)
- [ ] D1 + R2 provisioned; wrangler deploy green
- [ ] Admin passkey on workers.dev
- [ ] Scaffold promoted to repo root; Next.js marketing tree removed
- [ ] `altix.exchange` on Worker; Vercel domain removed
- [ ] Production curl checklist (IA + redirects + sitemap)
- [ ] platform.altix.exchange still the marketplace

## Success Criteria

- [ ] `https://altix.exchange/` is EmDash (check `/_emdash/admin` exists, no Next.js `/login` CMS toolbar)
- [ ] All success boxes in `plan.md` checked
- [ ] Rollback path: tag `pre-emdash-next` + Vercel project still has that Next.js deploy

## Risk Assessment

DNS TTL / mixed Vercel+CF can split traffic. Cut over apex + www together. Confirm nameservers before attaching the domain.

Merging EmDash root onto Vercel production before DNS cutover = failed Next.js build and no instant rollback. Tag first.

Seed will **not** re-apply on the second deploy. Content after wizard lives in D1 — treat D1 as production data; backup before schema upgrades.

EmDash 1.0 may land soon. Pin version; upgrade in a later plan, not during cutover.

## Security Considerations

- Admin is passkey on `/_emdash/admin`. Do not expose homemade `/login` JWT.
- R2 media is public-read for published assets only (follow template defaults).
- Modals still must not accept privileged case files (existing disclaimer copy).

## Next Steps

Follow-up (not this plan): deprecate unused `lix-api` `/api/v1/admin/cms/*` and `/api/v1/public/cms/*`.
