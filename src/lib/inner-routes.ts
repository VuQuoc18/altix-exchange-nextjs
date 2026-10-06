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
