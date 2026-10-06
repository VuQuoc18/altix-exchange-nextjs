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
