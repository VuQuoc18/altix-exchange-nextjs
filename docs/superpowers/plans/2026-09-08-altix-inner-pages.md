# ALTIX Inner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put production-build inner-page copy into EmDash `pages` entries, add the seven missing routes, and render display-only forms — without changing the homepage, Insights posts, or header CTAs.

**Architecture:** A Node parser reads `<main>` from `/Users/admin/Downloads/ALTIX-Website-Production-Build` into CMS fields (`eyebrow`, `title`, `lead`, `content` Portable Text, `sections`, `notice`). `[slug].astro` stays the inner-page template; it gains an allowlist extension and a `DisplayForm` island for four form slugs. Seed files are updated by a sync script; live D1 is upserted with EmDash CLI after local verification.

**Tech Stack:** Astro 7, EmDash 0.35 (`pages` collection), React SiteChrome (untouched), Node `node:test`, Cloudflare Worker `altix-marketing`.

## Global Constraints

- Source of wording: matching `*.html` `<main>` only — never header/footer from the production build.
- Rewrite `./foo.html` → `/foo` and `./insights/index.html` → `/insights`.
- Homepage (`seed` slug `home`) must not be overwritten.
- Do not port `insights/*.html` or create `/newsroom` as a page (`/newsroom` stays 301 → `/insights`).
- Header CTAs stay: Institutional access modal; Submit a case → `https://platform.altix.exchange/`.
- Forms are display-only: `preventDefault`, no `fetch`, no file inputs.
- No new Portable Text block types.
- No RisikoTek footer column.
- Legal pages keep the notice banner; if production HTML contains `Production note` or `Pre-launch legal task`, use that production sentence as `notice`.
- `editorial-policy` uses the inner-page template, not the legal layout.

## File map

| File | Responsibility |
| --- | --- |
| `src/lib/inner-routes.ts` | Allowlist, legal slugs, form slugs |
| `src/lib/display-forms.ts` | Field configs for the four inert forms |
| `src/components/forms/DisplayForm.astro` | Renders one inert form from config |
| `src/pages/[slug].astro` | Route + template; imports route sets + DisplayForm |
| `src/pages/sitemap.xml.ts` | Public URL list |
| `src/components/Footer.astro` | Contact + Editorial policy links |
| `astro.config.mjs`, `seed/seed.json`, `.emdash/seed.json` | `/contact` live; `/contact-us` → `/contact` |
| `scripts/altix-html.mjs` | Parse HTML → page records |
| `scripts/altix-html.test.mjs` | Parser tests |
| `scripts/sync-altix-pages.mjs` | Write records into both seed files |
| `scripts/verify-inner-pages.mjs` | HTTP checks against a running site |

---

### Task 1: Inner route constants

**Files:**
- Create: `src/lib/inner-routes.ts`
- Create: `scripts/inner-routes.test.mjs`
- Modify: `package.json` (add `"test:inner-pages": "node --test scripts/inner-routes.test.mjs scripts/altix-html.test.mjs"`)

**Interfaces:**
- Consumes: nothing
- Produces: `INNER_PAGE_SLUGS`, `LEGAL_SLUGS`, `FORM_SLUGS`, `NEW_PAGE_SLUGS` as `readonly string[]`

- [ ] **Step 1: Write the failing test**

Create `scripts/inner-routes.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  INNER_PAGE_SLUGS,
  LEGAL_SLUGS,
  FORM_SLUGS,
  NEW_PAGE_SLUGS,
} from "../src/lib/inner-routes.ts";

test("new production slugs are allowlisted", () => {
  for (const slug of [
    "global-asset-recovery",
    "forensic-intelligence",
    "contact",
    "submit-a-matter",
    "request-institutional-access",
    "thank-you",
    "editorial-policy",
  ]) {
    assert.ok(INNER_PAGE_SLUGS.includes(slug), slug);
  }
});

test("form slugs are a subset of inner pages", () => {
  for (const slug of FORM_SLUGS) {
    assert.ok(INNER_PAGE_SLUGS.includes(slug), slug);
  }
  assert.deepEqual(
    [...FORM_SLUGS].sort(),
    [
      "contact",
      "expert-network",
      "request-institutional-access",
      "submit-a-matter",
    ].sort(),
  );
});

test("editorial-policy is not a legal slug", () => {
  assert.equal(LEGAL_SLUGS.includes("editorial-policy"), false);
  assert.ok(INNER_PAGE_SLUGS.includes("editorial-policy"));
});

test("NEW_PAGE_SLUGS has exactly the seven additions", () => {
  assert.equal(NEW_PAGE_SLUGS.length, 7);
});
```

Node 22+ can import TypeScript if the project already does; if `node --test` fails to load `.ts`, switch the constants file to `src/lib/inner-routes.js` **or** keep `.ts` and run tests via:

```
node --experimental-strip-types --test scripts/inner-routes.test.mjs
```

Use `--experimental-strip-types` in the npm script if strip-types is available; otherwise duplicate the arrays in a `.mjs` next to the tests **only if** strip-types is missing — prefer one `src/lib/inner-routes.ts` source.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test scripts/inner-routes.test.mjs`

Expected: FAIL (`Cannot find module '../src/lib/inner-routes.ts'`)

- [ ] **Step 3: Write the constants**

Create `src/lib/inner-routes.ts`:

```ts
export const NEW_PAGE_SLUGS = [
  "global-asset-recovery",
  "forensic-intelligence",
  "contact",
  "submit-a-matter",
  "request-institutional-access",
  "thank-you",
  "editorial-policy",
] as const;

export const LEGAL_SLUGS = [
  "privacy",
  "terms",
  "cookies",
  "disclosures",
  "security",
  "complaints",
] as const;

export const FORM_SLUGS = [
  "contact",
  "submit-a-matter",
  "request-institutional-access",
  "expert-network",
] as const;

export const INNER_PAGE_SLUGS = [
  "what-we-do",
  "how-it-works",
  "who-we-work-with",
  "expert-network",
  "about",
  "case-readiness",
  "litigation-funding",
  "case-administration",
  "claimants-and-businesses",
  "law-firms",
  "funding-participants",
  "forensic-experts",
  "company-facts",
  ...LEGAL_SLUGS,
  ...NEW_PAGE_SLUGS,
] as const;

export type InnerPageSlug = (typeof INNER_PAGE_SLUGS)[number];
export type FormSlug = (typeof FORM_SLUGS)[number];

export function isInnerPageSlug(slug: string): slug is InnerPageSlug {
  return (INNER_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function isLegalSlug(slug: string): boolean {
  return (LEGAL_SLUGS as readonly string[]).includes(slug);
}

export function isFormSlug(slug: string): slug is FormSlug {
  return (FORM_SLUGS as readonly string[]).includes(slug);
}
```

Add to `package.json` scripts:

```json
"test:inner-pages": "node --experimental-strip-types --test scripts/inner-routes.test.mjs scripts/altix-html.test.mjs"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test scripts/inner-routes.test.mjs`

Expected: PASS (3 tests; `altix-html.test.mjs` is not created yet — run only `inner-routes.test.mjs` until Task 2)

- [ ] **Step 5: Commit**

```bash
git add src/lib/inner-routes.ts scripts/inner-routes.test.mjs package.json
git commit -m "$(cat <<'EOF'
feat(marketing): add inner page slug constants from production build

EOF
)"
```

---

### Task 2: HTML → CMS record parser

**Files:**
- Create: `scripts/altix-html.mjs`
- Create: `scripts/altix-html.test.mjs`

**Interfaces:**
- Consumes: production HTML directory
- Produces: `parseInnerPage(html, slug) → PageRecord`

```ts
// PageRecord shape written into seed.json data:
{
  title: string;
  eyebrow?: string;
  lead?: string;
  content?: Array<{ _type: "block"; style: "normal" | "h2" | "h3"; children: Array<{ _type: "span"; text: string }> }>;
  sections?: Array<{ title: string; body: string }>;
  notice?: string;
  contact?: string;
  seoTitle?: string;
  seoDescription?: string;
}
```

- [ ] **Step 1: Write the failing test**

Create `scripts/altix-html.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseInnerPage, rewriteHref } from "./altix-html.mjs";

const ROOT = "/Users/admin/Downloads/ALTIX-Website-Production-Build";

test("rewriteHref strips .html and maps insights index", () => {
  assert.equal(rewriteHref("./case-readiness.html"), "/case-readiness");
  assert.equal(rewriteHref("./insights/index.html"), "/insights");
  assert.equal(rewriteHref("./about/leadership/elke-biechele.html"), "/about/leadership/elke-biechele");
  assert.equal(rewriteHref("mailto:info@altix.exchange"), "mailto:info@altix.exchange");
});

test("what-we-do maps hero and five service cards", () => {
  const html = fs.readFileSync(path.join(ROOT, "what-we-do.html"), "utf8");
  const page = parseInnerPage(html, "what-we-do");
  assert.equal(page.title, "Prepare, structure and support selected legal assets.");
  assert.match(page.eyebrow.toLowerCase(), /what altix does/);
  assert.match(page.lead, /case preparation/i);
  assert.equal(page.sections.length, 5);
  assert.equal(page.sections[0].title, "Case Readiness");
  assert.match(page.sections[2].title, /Global Asset Recovery/);
  assert.equal(page.sections[3].title, "Forensic Intelligence");
});

test("privacy keeps a production-note notice", () => {
  const html = fs.readFileSync(path.join(ROOT, "privacy.html"), "utf8");
  const page = parseInnerPage(html, "privacy");
  assert.equal(page.title, "Privacy Notice");
  assert.match(page.notice, /Production note|Pre-launch/i);
  assert.equal(page.contact, "info@altix.exchange");
});

test("contact lead comes from hero, not the form", () => {
  const html = fs.readFileSync(path.join(ROOT, "contact.html"), "utf8");
  const page = parseInnerPage(html, "contact");
  assert.equal(page.title, "Contact ALTIX Exchange");
  assert.match(page.lead, /enquiry/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/altix-html.test.mjs`

Expected: FAIL (`Cannot find module './altix-html.mjs'`)

- [ ] **Step 3: Implement the parser**

Create `scripts/altix-html.mjs` with this complete module (do not split across files):

```js
import { decode } from "node:html"; // if this import fails, use the decodeHtml() below only

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function rewriteHref(href) {
  if (!href) return href;
  if (href.startsWith("mailto:") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#")) {
    return href;
  }
  let next = href.replace(/^\.\//, "/").replace(/^\//, "/");
  next = next.replace(/\.html$/, "");
  next = next.replace(/\/index$/, "");
  if (!next.startsWith("/")) next = `/${next}`;
  return next;
}

function stripTags(html) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractMain(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function first(html, re) {
  const m = html.match(re);
  return m ? m[1] : "";
}

function ptBlock(style, text) {
  if (!text) return null;
  return {
    _type: "block",
    style,
    children: [{ _type: "span", text }],
  };
}

export function parseInnerPage(html, slug) {
  const headTitle = stripTags(first(html, /<title>([\s\S]*?)<\/title>/i));
  const metaDesc = first(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const main = extractMain(html).replace(/<form\b[\s\S]*?<\/form>/gi, "");

  const eyebrow = stripTags(first(main, /<span class="eyebrow[^"]*">([\s\S]*?)<\/span>/));
  const title = stripTags(first(main, /<h1\b[^>]*>([\s\S]*?)<\/h1>/));
  const lead = stripTags(first(main, /<p class="hero-lead">([\s\S]*?)<\/p>/));

  const sections = [];
  const cardRe = /<article class="card">([\s\S]*?)<\/article>/g;
  let card;
  while ((card = cardRe.exec(main))) {
    const block = card[1];
    const cardTitle = stripTags(first(block, /<h3\b[^>]*>([\s\S]*?)<\/h3>/));
    const cardBody = stripTags(first(block, /<p\b[^>]*>([\s\S]*?)<\/p>/));
    if (cardTitle) sections.push({ title: cardTitle, body: cardBody });
  }

  const content = [];
  const withoutHero = main.replace(/<section class="hero"[\s\S]*?<\/section>/i, "");
  const withoutCards = withoutHero.replace(/<div class="card-grid">[\s\S]*?<\/div>/i, "");
  const chunks = [...withoutCards.matchAll(/<(h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const m of chunks) {
    const tag = m[1].toLowerCase();
    const text = stripTags(m[2]);
    if (!text) continue;
    if (text === lead || text === title) continue;
    const style = tag === "h2" ? "h2" : tag === "h3" ? "h3" : "normal";
    const block = ptBlock(style, text);
    if (block) content.push(block);
  }

  const data = {
    title: title || slug,
    eyebrow: eyebrow || undefined,
    lead: lead || undefined,
    content: content.length ? content : undefined,
    sections: sections.length ? sections : undefined,
  };

  const legal = ["privacy", "terms", "cookies", "disclosures", "security", "complaints"];
  if (legal.includes(slug)) {
    const hay = stripTags(main);
    const noticeMatch = hay.match(/([^.]*?(Production note|Pre-launch legal task)[^.]*\.)/i);
    data.notice = noticeMatch
      ? noticeMatch[1].trim()
      : "This page is a temporary scaffold. For questions or policy details, please contact info@altix.exchange.";
    data.contact = "info@altix.exchange";
  }

  if (headTitle) data.seoTitle = headTitle;
  if (metaDesc) data.seoDescription = metaDesc;
  return data;
}

export function htmlFileForSlug(slug) {
  if (slug === "about-leadership") return "about/leadership/elke-biechele.html";
  return `${slug}.html`;
}
```

Delete the `import { decode } from "node:html"` line if you copied the comment — **use only `decodeHtml`**. Do not import `node:html`.

- [ ] **Step 4: Run tests**

Run: `node --test scripts/altix-html.test.mjs`

Expected: all 4 tests PASS. If `what-we-do` title assertion fails on extra punctuation, print `page.title` and fix the assertion to the exact stripped `h1` (em tags removed).

- [ ] **Step 5: Commit**

```bash
git add scripts/altix-html.mjs scripts/altix-html.test.mjs
git commit -m "$(cat <<'EOF'
feat(marketing): parse ALTIX production HTML into CMS page records

EOF
)"
```

---

### Task 3: Routes, redirects, sitemap

**Files:**
- Modify: `src/pages/[slug].astro` (allowlist only in this task)
- Modify: `astro.config.mjs` redirects
- Modify: `seed/seed.json` redirects array (the `redirects` key, not page content)
- Modify: `.emdash/seed.json` same redirects
- Modify: `src/pages/sitemap.xml.ts`

**Interfaces:**
- Consumes: `INNER_PAGE_SLUGS`, `LEGAL_SLUGS` from `src/lib/inner-routes.ts`
- Produces: `/contact` is not redirected; seven new slugs are routable once CMS entries exist

- [ ] **Step 1: Write a failing redirect check**

Create `scripts/redirects.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("astro.config no longer sends /contact home", () => {
  const src = fs.readFileSync(new URL("../astro.config.mjs", import.meta.url), "utf8");
  assert.equal(/"\/contact":\s*\{\s*destination:\s*"\/"/.test(src), false);
  assert.match(src, /"\/contact-us":\s*\{\s*destination:\s*"\/contact"/);
});
```

Run: `node --test scripts/redirects.test.mjs`

Expected: FAIL (`assert.equal` false is true — current file still has `/contact` → `/`)

- [ ] **Step 2: Confirm failure**

Expected output contains `redirects.test.mjs` failure on `/contact`.

- [ ] **Step 3: Implement routing changes**

In `src/pages/[slug].astro`, replace the inline `ALLOWLIST` / `LEGAL_SLUGS` sets with:

```ts
import {
  INNER_PAGE_SLUGS,
  isFormSlug,
  isInnerPageSlug,
  isLegalSlug,
} from "../lib/inner-routes";
```

Replace the guard:

```ts
const { slug } = Astro.params;

if (!slug || !isInnerPageSlug(slug)) {
  Astro.response.status = 404;
  return Astro.rewrite("/404");
}
```

Replace `LEGAL_SLUGS.has(slug)` with `isLegalSlug(slug)`. Keep the rest of the file unchanged in this task (forms come in Task 5).

In `astro.config.mjs` `redirects`, replace:

```js
"/contact-us": { destination: "/", status: 301 },
"/contact": { destination: "/", status: 301 },
```

with:

```js
"/contact-us": { destination: "/contact", status: 301 },
```

Do not add a `/contact` → `/` entry.

In `seed/seed.json` and `.emdash/seed.json`, change the `/contact-us` redirect object to `"destination": "/contact"` and **delete** the `{ "source": "/contact", "destination": "/" }` object if present.

In `src/pages/sitemap.xml.ts`, replace `ALLOWLISTED_SLUGS` with:

```ts
import { INNER_PAGE_SLUGS } from "../lib/inner-routes";

const ALLOWLISTED_SLUGS = INNER_PAGE_SLUGS.map((slug) => `/${slug}`);
```

- [ ] **Step 4: Re-run redirect test**

Run: `node --test scripts/redirects.test.mjs`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/[slug].astro src/pages/sitemap.xml.ts astro.config.mjs seed/seed.json .emdash/seed.json scripts/redirects.test.mjs
git commit -m "$(cat <<'EOF'
feat(marketing): allow new inner routes and serve /contact

EOF
)"
```

---

### Task 4: Display-only form config + component

**Files:**
- Create: `src/lib/display-forms.ts`
- Create: `src/components/forms/DisplayForm.astro`
- Create: `scripts/display-forms.test.mjs`

**Interfaces:**
- Consumes: `FormSlug` from `inner-routes.ts`
- Produces: `getDisplayForm(slug: FormSlug): DisplayFormConfig`

```ts
export type DisplayField =
  | { kind: "honeypot"; name: string; label: string }
  | { kind: "hidden"; name: string; value: string }
  | { kind: "text" | "email" | "url" | "date" | "tel"; name: string; label: string; required?: boolean }
  | { kind: "textarea"; name: string; label: string; required?: boolean }
  | { kind: "select"; name: string; label: string; required?: boolean; options: string[] }
  | { kind: "checkbox"; name: string; label: string; required?: boolean };

export type DisplayFormConfig = {
  slug: FormSlug;
  formName: string;
  warning?: string;
  submitLabel: string;
  fields: DisplayField[];
};
```

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { getDisplayForm } from "../src/lib/display-forms.ts";

test("contact form is general-contact with required email", () => {
  const form = getDisplayForm("contact");
  assert.equal(form.formName, "general-contact");
  assert.ok(form.fields.some((f) => f.name === "email" && f.required));
  assert.ok(form.fields.some((f) => f.name === "enquiry-type" && f.kind === "select"));
});

test("matter form includes claim-value options", () => {
  const form = getDisplayForm("submit-a-matter");
  const field = form.fields.find((f) => f.name === "claim-value");
  assert.equal(field.kind, "select");
  assert.ok(field.options.includes("Above €25m"));
});
```

Run: `node --experimental-strip-types --test scripts/display-forms.test.mjs`

Expected: FAIL (module not found)

- [ ] **Step 2: Confirm failure**

Expected: `ERR_MODULE_NOT_FOUND` for `display-forms.ts`

- [ ] **Step 3: Implement config + Astro form**

Create `src/lib/display-forms.ts` with **all four** configs (field names must match production):

```ts
import type { FormSlug } from "./inner-routes";

export type DisplayField =
  | { kind: "honeypot"; name: string; label: string }
  | { kind: "hidden"; name: string; value: string }
  | {
      kind: "text" | "email" | "url" | "date" | "tel";
      name: string;
      label: string;
      required?: boolean;
    }
  | { kind: "textarea"; name: string; label: string; required?: boolean }
  | {
      kind: "select";
      name: string;
      label: string;
      required?: boolean;
      options: string[];
    }
  | { kind: "checkbox"; name: string; label: string; required?: boolean };

export type DisplayFormConfig = {
  slug: FormSlug;
  formName: string;
  warning: string;
  submitLabel: string;
  fields: DisplayField[];
};

const WARNING =
  "Do not send privileged or highly sensitive evidence through this form. Nothing is submitted from this page.";

const FORMS: Record<FormSlug, DisplayFormConfig> = {
  contact: {
    slug: "contact",
    formName: "general-contact",
    warning: WARNING,
    submitLabel: "Send enquiry",
    fields: [
      { kind: "hidden", name: "form-name", value: "general-contact" },
      { kind: "honeypot", name: "bot-field", label: "Do not fill" },
      { kind: "text", name: "name", label: "Full name", required: true },
      { kind: "text", name: "organization", label: "Organization" },
      { kind: "email", name: "email", label: "Work email", required: true },
      { kind: "text", name: "country", label: "Country" },
      {
        kind: "select",
        name: "enquiry-type",
        label: "Enquiry type",
        options: ["General", "Media", "Speaking", "Research", "Professional network"],
      },
      { kind: "textarea", name: "message", label: "Message", required: true },
      {
        kind: "checkbox",
        name: "privacy",
        label:
          "I agree to the processing of this enquiry in accordance with the ALTIX Privacy Notice.",
        required: true,
      },
    ],
  },
  "submit-a-matter": {
    slug: "submit-a-matter",
    formName: "matter-submission",
    warning: WARNING,
    submitLabel: "Submit for initial review",
    fields: [
      { kind: "hidden", name: "form-name", value: "matter-submission" },
      { kind: "honeypot", name: "bot-field", label: "Do not fill" },
      { kind: "text", name: "name", label: "Full name", required: true },
      { kind: "text", name: "company", label: "Company / claimant name", required: true },
      { kind: "email", name: "email", label: "Work email", required: true },
      { kind: "tel", name: "phone", label: "Telephone" },
      {
        kind: "select",
        name: "role",
        label: "Your role",
        required: true,
        options: [
          "Select",
          "Claimant",
          "Company representative",
          "Lawyer / legal adviser",
          "Insolvency practitioner",
          "Authorized representative",
        ],
      },
      {
        kind: "select",
        name: "matter-type",
        label: "Matter type",
        required: true,
        options: [
          "Select",
          "Commercial dispute",
          "Fraud / investment loss",
          "Asset recovery",
          "Enforcement / judgment",
          "Insolvency / receivable",
          "Group / class-type matter",
          "Other",
        ],
      },
      {
        kind: "text",
        name: "claimant-jurisdiction",
        label: "Claimant jurisdiction",
        required: true,
      },
      {
        kind: "text",
        name: "defendant-jurisdiction",
        label: "Defendant jurisdiction",
        required: true,
      },
      {
        kind: "select",
        name: "claim-value",
        label: "Approximate claim-value range",
        required: true,
        options: [
          "Select",
          "Below €250,000",
          "€250,000–€1m",
          "€1m–€5m",
          "€5m–€25m",
          "Above €25m",
        ],
      },
      { kind: "text", name: "funding-requirement", label: "Approximate funding requirement" },
      { kind: "text", name: "procedural-stage", label: "Current procedural stage" },
      { kind: "date", name: "limitation-date", label: "Known filing / limitation date" },
      {
        kind: "textarea",
        name: "summary",
        label: "Short non-confidential summary",
        required: true,
      },
      {
        kind: "checkbox",
        name: "authority",
        label:
          "I confirm that I am the claimant, an authorized representative or a legal adviser.",
        required: true,
      },
      {
        kind: "checkbox",
        name: "privacy",
        label:
          "I agree to the processing of this submission in accordance with the ALTIX Privacy Notice.",
        required: true,
      },
    ],
  },
  "request-institutional-access": {
    slug: "request-institutional-access",
    formName: "institutional-access",
    warning: WARNING,
    submitLabel: "Request access",
    fields: [
      { kind: "hidden", name: "form-name", value: "institutional-access" },
      { kind: "honeypot", name: "bot-field", label: "Do not fill" },
      { kind: "text", name: "name", label: "Full name", required: true },
      { kind: "text", name: "title", label: "Professional title", required: true },
      { kind: "text", name: "organization", label: "Organization", required: true },
      { kind: "email", name: "email", label: "Work email", required: true },
      { kind: "text", name: "country", label: "Country", required: true },
      {
        kind: "select",
        name: "investor-type",
        label: "Investor type",
        required: true,
        options: [
          "Select",
          "Litigation funder",
          "Family office",
          "Special situations investor",
          "Private credit",
          "Institutional alternatives team",
          "Insurer / strategic financial partner",
          "Other professional investor",
        ],
      },
      { kind: "text", name: "allocation-range", label: "Typical allocation range" },
      { kind: "text", name: "jurisdictions", label: "Preferred jurisdictions" },
      { kind: "textarea", name: "case-types", label: "Preferred case types" },
      { kind: "textarea", name: "experience", label: "Relevant litigation-finance experience" },
      {
        kind: "checkbox",
        name: "risk",
        label:
          "I understand that litigation and recovery investments are illiquid, uncertain and may result in loss.",
        required: true,
      },
      {
        kind: "checkbox",
        name: "eligibility",
        label: "I consent to eligibility, KYC/AML and source-of-funds review where required.",
        required: true,
      },
    ],
  },
  "expert-network": {
    slug: "expert-network",
    formName: "professional-network",
    warning: WARNING,
    submitLabel: "Submit profile",
    fields: [
      { kind: "hidden", name: "form-name", value: "professional-network" },
      { kind: "honeypot", name: "bot-field", label: "Do not fill this out" },
      { kind: "text", name: "name", label: "Full name", required: true },
      { kind: "text", name: "title", label: "Professional title", required: true },
      { kind: "text", name: "organization", label: "Firm / organization", required: true },
      { kind: "email", name: "email", label: "Work email", required: true },
      { kind: "text", name: "jurisdiction", label: "Country / jurisdiction", required: true },
      {
        kind: "select",
        name: "category",
        label: "Category",
        required: true,
        options: ["Select", "Legal Expert", "Forensic Expert", "Funding Participant"],
      },
      { kind: "textarea", name: "expertise", label: "Primary expertise", required: true },
      { kind: "url", name: "profile", label: "Website or LinkedIn" },
      {
        kind: "checkbox",
        name: "consent",
        label:
          "I understand that submission does not create a membership, partnership, employment or mandate.",
        required: true,
      },
    ],
  },
};

export function getDisplayForm(slug: FormSlug): DisplayFormConfig {
  return FORMS[slug];
}
```

Create `src/components/forms/DisplayForm.astro`:

```astro
---
import { getDisplayForm, type DisplayField } from "../../lib/display-forms";
import type { FormSlug } from "../../lib/inner-routes";

interface Props {
  slug: FormSlug;
}

const { slug } = Astro.props;
const form = getDisplayForm(slug);

function inputType(field: DisplayField): string {
  if (field.kind === "email" || field.kind === "url" || field.kind === "date" || field.kind === "tel") {
    return field.kind;
  }
  return "text";
}
---

<section class="display-form section">
  <div class="container narrow">
    <p class="form-warning">{form.warning}</p>
    <form
      class="form-card"
      name={form.formName}
      onsubmit="event.preventDefault(); return false;"
    >
      {form.fields.map((field) => {
        if (field.kind === "hidden") {
          return <input type="hidden" name={field.name} value={field.value} />;
        }
        if (field.kind === "honeypot") {
          return (
            <label class="hp">
              {field.label}
              <input type="text" name={field.name} tabindex="-1" autocomplete="off" />
            </label>
          );
        }
        if (field.kind === "textarea") {
          return (
            <label class="field">
              {field.label}
              <textarea name={field.name} required={field.required} rows="5" />
            </label>
          );
        }
        if (field.kind === "select") {
          return (
            <label class="field">
              {field.label}
              <select name={field.name} required={field.required}>
                {field.options.map((opt) => (
                  <option value={opt === "Select" ? "" : opt}>{opt}</option>
                ))}
              </select>
            </label>
          );
        }
        if (field.kind === "checkbox") {
          return (
            <label class="check">
              <input type="checkbox" name={field.name} required={field.required} />
              <span>{field.label}</span>
            </label>
          );
        }
        return (
          <label class="field">
            {field.label}
            <input type={inputType(field)} name={field.name} required={field.required} />
          </label>
        );
      })}
      <button class="button" type="submit">{form.submitLabel}</button>
    </form>
  </div>
</section>

<style>
  .hp {
    position: absolute;
    left: -9999px;
  }
  .form-warning {
    color: var(--muted);
    margin-bottom: 1.25rem;
    max-width: 70ch;
  }
  .form-card {
    display: grid;
    gap: 14px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 1.5rem;
  }
  .field,
  .check {
    display: grid;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--navy);
  }
  .check {
    grid-template-columns: auto 1fr;
    align-items: start;
    font-weight: 500;
  }
  .field input,
  .field textarea,
  .field select {
    font: inherit;
    font-weight: 400;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
  }
</style>
```

- [ ] **Step 4: Run config tests**

Run: `node --experimental-strip-types --test scripts/display-forms.test.mjs`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/display-forms.ts src/components/forms/DisplayForm.astro scripts/display-forms.test.mjs
git commit -m "$(cat <<'EOF'
feat(marketing): add display-only ALTIX enquiry forms

EOF
)"
```

---

### Task 5: Render DisplayForm on form slugs

**Files:**
- Modify: `src/pages/[slug].astro`

**Interfaces:**
- Consumes: `isFormSlug(slug)`, `DisplayForm`
- Produces: form markup on the four slugs, after `sections`, before `CtaBand`

- [ ] **Step 1: Add a grep-based failing check**

Create `scripts/slug-form-wire.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("[slug].astro mounts DisplayForm for form slugs", () => {
  const src = fs.readFileSync(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
  assert.match(src, /DisplayForm/);
  assert.match(src, /isFormSlug/);
});
```

Run: `node --test scripts/slug-form-wire.test.mjs`

Expected: FAIL (no `DisplayForm` yet)

- [ ] **Step 2: Confirm failure**

Expected: assertion fail on `/DisplayForm/`

- [ ] **Step 3: Wire the component**

At top of `[slug].astro` add:

```ts
import DisplayForm from "../components/forms/DisplayForm.astro";
```

(`isFormSlug` already imported in Task 3.)

Inside the non-legal `inner-page` branch, **after** the `sections` block and **before** `<CtaBand>`, insert:

```astro
{isFormSlug(slug) && <DisplayForm slug={slug} />}
```

- [ ] **Step 4: Re-run wire test**

Run: `node --test scripts/slug-form-wire.test.mjs`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/[slug].astro scripts/slug-form-wire.test.mjs
git commit -m "$(cat <<'EOF'
feat(marketing): render inert forms on contact and related pages

EOF
)"
```

---

### Task 6: Footer discovery links

**Files:**
- Modify: `src/components/Footer.astro`
- Create: `scripts/footer-links.test.mjs`

**Interfaces:**
- Consumes: none
- Produces: footer Company column includes Contact and Editorial policy

- [ ] **Step 1: Write failing test**

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("footer links contact and editorial policy", () => {
  const src = fs.readFileSync(new URL("../src/components/Footer.astro", import.meta.url), "utf8");
  assert.match(src, /href="\/contact"/);
  assert.match(src, /href="\/editorial-policy"/);
  assert.equal(src.includes("RisikoTek"), false);
});
```

Run: `node --test scripts/footer-links.test.mjs`

Expected: FAIL (no `/contact` in footer)

- [ ] **Step 2: Confirm failure**

- [ ] **Step 3: Edit footer Company column**

Replace the Company block with:

```astro
    <div>
      <h3>Company</h3>
      <a href="/about">About</a>
      <a href="/company-facts">Company facts</a>
      <a href="/insights">Insights</a>
      <a href="/contact">Contact</a>
      <a href="/editorial-policy">Editorial policy</a>
    </div>
```

Do not add a fifth grid column. Do not change the logo.

- [ ] **Step 4: Re-run test**

Run: `node --test scripts/footer-links.test.mjs`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro scripts/footer-links.test.mjs
git commit -m "$(cat <<'EOF'
feat(marketing): link Contact and Editorial policy in the footer

EOF
)"
```

---

### Task 7: Sync production copy into seed files

**Files:**
- Create: `scripts/sync-altix-pages.mjs`
- Modify: `seed/seed.json` (via script)
- Modify: `.emdash/seed.json` (via script)

**Interfaces:**
- Consumes: `parseInnerPage`, `htmlFileForSlug`, `INNER_PAGE_SLUGS`
- Produces: updated `content.pages[]` entries; **never** mutates `slug === "home"`

- [ ] **Step 1: Write a failing seed invariant test** (run after sync; write it first so the first run fails on missing contact entry)

Create `scripts/seed-pages.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const seed = JSON.parse(fs.readFileSync(new URL("../seed/seed.json", import.meta.url), "utf8"));
const pages = seed.content.pages;

test("home entry still exists", () => {
  assert.ok(pages.some((p) => p.slug === "home"));
});

test("contact page is seeded with production title", () => {
  const page = pages.find((p) => p.slug === "contact");
  assert.ok(page, "missing contact");
  assert.equal(page.data.title, "Contact ALTIX Exchange");
});

test("what-we-do has five sections after sync", () => {
  const page = pages.find((p) => p.slug === "what-we-do");
  assert.equal(page.data.sections.length, 5);
});
```

Run: `node --test scripts/seed-pages.test.mjs`

Expected: FAIL (`missing contact`)

- [ ] **Step 2: Confirm failure**

- [ ] **Step 3: Implement and run the sync script**

Create `scripts/sync-altix-pages.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { INNER_PAGE_SLUGS } from "../src/lib/inner-routes.ts";
import { htmlFileForSlug, parseInnerPage } from "./altix-html.mjs";

const ROOT = process.env.ALTIX_HTML_DIR || "/Users/admin/Downloads/ALTIX-Website-Production-Build";
const SEED_PATHS = ["seed/seed.json", ".emdash/seed.json"];

function upsertPages(seed) {
  const bySlug = new Map(seed.content.pages.map((p) => [p.slug, p]));
  for (const slug of INNER_PAGE_SLUGS) {
    const file = path.join(ROOT, htmlFileForSlug(slug));
    if (!fs.existsSync(file)) {
      throw new Error(`Missing HTML for ${slug}: ${file}`);
    }
    const data = parseInnerPage(fs.readFileSync(file, "utf8"), slug);
    const existing = bySlug.get(slug);
    const next = {
      id: existing?.id || slug,
      slug,
      status: "published",
      data: { ...(existing?.data || {}), ...data },
    };
    bySlug.set(slug, next);
  }
  const home = seed.content.pages.find((p) => p.slug === "home");
  const rest = [...bySlug.values()].filter((p) => p.slug !== "home");
  seed.content.pages = home ? [home, ...rest] : rest;
  return seed;
}

for (const rel of SEED_PATHS) {
  const abs = path.resolve(rel);
  const seed = JSON.parse(fs.readFileSync(abs, "utf8"));
  const next = upsertPages(seed);
  fs.writeFileSync(abs, `${JSON.stringify(next, null, "\t")}\n`);
  console.log("updated", rel, "pages", next.content.pages.length);
}
```

If Node cannot import `../src/lib/inner-routes.ts` from this script, inline the `INNER_PAGE_SLUGS` array (copy the full array from Task 1) instead of importing.

Run: `node --experimental-strip-types scripts/sync-altix-pages.mjs`

Expected: `updated seed/seed.json` and `updated .emdash/seed.json` with no throw.

- [ ] **Step 4: Re-run seed tests**

Run: `node --test scripts/seed-pages.test.mjs`

Expected: PASS. If titles differ by a period/em-dash, fix `parseInnerPage` or the assertion to the exact stripped `h1`.

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-altix-pages.mjs scripts/seed-pages.test.mjs seed/seed.json .emdash/seed.json
git commit -m "$(cat <<'EOF'
feat(marketing): seed inner pages from the ALTIX production HTML

EOF
)"
```

---

### Task 8: Refresh Elke leadership CMS copy

**Files:**
- Modify: `seed/seed.json` entry `slug: "about-leadership"`
- Modify: `.emdash/seed.json` same entry
- Modify: `src/pages/about/leadership/elke-biechele.astro` only if a field name is missing (prefer filling `title`, `eyebrow`, `lead`, `bio`, `role` on the CMS entry)

**Interfaces:**
- Consumes: `about/leadership/elke-biechele.html` `<main>`
- Produces: `/about/leadership/elke-biechele` still the only leadership URL

Production mapping (write these exact strings into `data`):

- `title`: `Elke Biechele`
- `eyebrow`: `Leadership`
- `role`: `Founder and Chief Executive Officer of ALTIX Exchange.`
- `lead`: `Founder and Chief Executive Officer of ALTIX Exchange.`
- `name`: `Elke Biechele`
- `bio`: `Elke Biechele is the founder and CEO of ALTIX Exchange. ALTIX management materials describe more than 25 years of experience across financial services, risk management, financial crime, technology and entrepreneurship.`
- `trackRecord`: `Those materials also state that she has spent the past eight years focused on complex international financial-crime investigations and asset-recovery work.`
- `background`: `Before adding specific employer names, awards, media quotes or client logos to this page, verify each statement and retain the supporting record in the ALTIX Public Claims Register.`

- [ ] **Step 1: Write failing test**

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const seed = JSON.parse(fs.readFileSync(new URL("../seed/seed.json", import.meta.url), "utf8"));
const page = seed.content.pages.find((p) => p.slug === "about-leadership");

test("elke CMS copy matches production biography", () => {
  assert.equal(page.data.title, "Elke Biechele");
  assert.match(page.data.bio, /25 years/);
  assert.match(page.data.background, /Public Claims Register/);
});
```

Run: `node --test scripts/elke-seed.test.mjs` (save as that path)

Expected: FAIL on title (`Elke Biechele - Leadership Profile`)

- [ ] **Step 2: Confirm failure**

- [ ] **Step 3: Patch both seed files**

Update the `about-leadership` `data` object with the fields listed above. Do not change `elke-biechele.astro` routing (`getEmDashEntry("pages", "about-leadership")`).

- [ ] **Step 4: Re-run test**

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add seed/seed.json .emdash/seed.json scripts/elke-seed.test.mjs
git commit -m "$(cat <<'EOF'
feat(marketing): refresh Elke leadership copy from production HTML

EOF
)"
```

---

### Task 9: Local HTTP verification

**Files:**
- Create: `scripts/verify-inner-pages.mjs`

**Interfaces:**
- Consumes: a running `pnpm dev` origin (`ORIGIN`, default `http://127.0.0.1:4321`)
- Produces: exit 0 only if checks pass

- [ ] **Step 1: Write the verifier (assertions are the test)**

```js
const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:4321";

const expect200 = [
  "/",
  "/insights",
  "/about/leadership/elke-biechele",
  "/what-we-do",
  "/contact",
  "/submit-a-matter",
  "/global-asset-recovery",
  "/forensic-intelligence",
  "/editorial-policy",
  "/thank-you",
  "/privacy",
];

const expect404 = ["/platform", "/solutions", "/this-slug-does-not-exist"];

async function probe(pathname) {
  const res = await fetch(`${ORIGIN}${pathname}`, { redirect: "manual" });
  const html = res.status < 400 && res.headers.get("content-type")?.includes("text/html")
    ? await res.text()
    : "";
  return { status: res.status, location: res.headers.get("location"), html };
}

const failures = [];

for (const path of expect200) {
  const { status, html } = await probe(path);
  if (status !== 200) failures.push(`${path} status ${status}`);
  if (path === "/what-we-do" && !/Case Readiness/i.test(html)) {
    failures.push("/what-we-do missing Case Readiness");
  }
  if (path === "/contact" && !/general-contact|Work email/i.test(html)) {
    failures.push("/contact missing form");
  }
}

for (const path of expect404) {
  const { status } = await probe(path);
  if (status !== 404 && status !== 200) {
    // Astro rewrite("/404") may still be 404; if 200, require 404 title
  }
  const { html, status: st } = await probe(path);
  const notFound = st === 404 || /Page not found/i.test(html);
  if (!notFound) failures.push(`${path} should 404, got ${st}`);
}

const contactUs = await probe("/contact-us");
if (contactUs.status !== 301 || !/\/contact$/.test(contactUs.location || "")) {
  failures.push(`/contact-us expected 301 to /contact, got ${contactUs.status} ${contactUs.location}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("verify-inner-pages ok");
```

- [ ] **Step 2: Run verifier against a stopped server to see it fail**

Run: `ORIGIN=http://127.0.0.1:4321 node scripts/verify-inner-pages.mjs`

Expected: FAIL (connection refused) — proves the script actually hits the network.

- [ ] **Step 3: Start the site and apply seed to local DB if needed**

Run from repo root (needs `all` permissions if Cloudflare Vite plugin requires it):

```bash
pnpm dev --host 127.0.0.1 --port 4321
```

Empty local D1 will ingest seed on first request. If local DB already has old page rows, either reset local D1 **or** upsert with:

```bash
npx emdash content list pages --limit 50
```

then `content update` / `create` per slug using `--file` JSON `{ "title": "...", ... }` from the synced seed entry `data`. Prefer reset-only if the developer is on a disposable local DB.

- [ ] **Step 4: Re-run verifier**

Run: `ORIGIN=http://127.0.0.1:4321 node scripts/verify-inner-pages.mjs`

Expected: `verify-inner-pages ok`

Also manually: open `/contact`, click submit — URL must stay `/contact` and Network tab must show no POST.

- [ ] **Step 5: Commit the verifier**

```bash
git add scripts/verify-inner-pages.mjs
git commit -m "$(cat <<'EOF'
test(marketing): add HTTP checks for inner pages and contact redirect

EOF
)"
```

---

### Task 10: Production D1 upsert + Worker deploy

**Files:**
- None new (CLI against running Worker / local preview)

**Interfaces:**
- Consumes: published `seed/seed.json` `content.pages` (except `home`)
- Produces: live `/contact` 200 with production title after deploy

Do **not** run this task until Task 9 is green.

- [ ] **Step 1: Dry-run list remote pages**

```bash
npx emdash login --url https://altix-marketing.vuquoc-dev.workers.dev
npx emdash content list pages --limit 50
```

Expected: JSON/table of existing slugs. Note `rev` for updates.

- [ ] **Step 2: Upsert each inner slug**

For each slug in `INNER_PAGE_SLUGS` plus `about-leadership`:

- If the entry exists: `npx emdash content get pages <id> --raw`, then `npx emdash content update pages <id> --rev <rev> --data '<json of data fields>'`
- If missing: `npx emdash content create pages --slug <slug> --data '<json>'`

`--data` must be the `data` object from `seed/seed.json` (title, eyebrow, lead, content, sections, notice, contact, bio, …). Do not send the homepage `home` entry.

- [ ] **Step 3: Deploy Worker** (allowlist/redirects live in the Worker bundle)

```bash
npx wrangler deploy
```

Expected: version id printed; `https://altix-marketing.vuquoc-dev.workers.dev/contact` is 200.

- [ ] **Step 4: Production verify**

```bash
ORIGIN=https://altix-marketing.vuquoc-dev.workers.dev node scripts/verify-inner-pages.mjs
```

Expected: `verify-inner-pages ok`

- [ ] **Step 5: Commit only if leftover local files remain**

If Task 10 produced no extra files, skip commit.

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Replace copy on existing inner slugs | 7 |
| Add seven new routes + CMS entries | 1, 3, 7 |
| Elke page copy, same URL | 8 |
| `/contact-us` → `/contact`; no `/contact` → `/` | 3 |
| Keep `[slug].astro` template | 3, 5 |
| Legal notice banner from production notes | 2, 7 |
| Display-only forms, no PT HTML | 4, 5 |
| Footer Contact + Editorial policy | 6 |
| Seed files updated | 7, 8 |
| Live D1 upsert + deploy | 10 |
| Homepage / Insights untouched | 7 (skip `home`), out of scope |
| Header CTAs unchanged | no SiteChrome edits |
| Verification list | 9, 10 |

No `TBD` remaining. Form field names match production `name=` attributes. `INNER_PAGE_SLUGS` is the single allowlist used by `[slug].astro`, sitemap, and the sync script.
