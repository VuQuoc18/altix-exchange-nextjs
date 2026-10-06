import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseInnerPage, rewriteHref } from "./altix-html.mjs";

const ROOT = "/Users/admin/Downloads/ALTIX-Website-Production-Build";

test("rewriteHref strips .html and maps insights index", () => {
  assert.equal(rewriteHref("./case-readiness.html"), "/case-readiness");
  assert.equal(rewriteHref("./insights/index.html"), "/insights");
  assert.equal(
    rewriteHref("./about/leadership/elke-biechele.html"),
    "/about/leadership/elke-biechele",
  );
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
