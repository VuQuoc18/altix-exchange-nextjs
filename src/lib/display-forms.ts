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
