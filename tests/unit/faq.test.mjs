import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { importComponent } from "./render-component.mjs";

test("conditional FAQ does not publish an empty section", async () => {
  const { TrustSupportSection } = await importComponent("src/components/sections/trust-support/TrustSupportSection.tsx");
  assert.equal(renderToStaticMarkup(React.createElement(TrustSupportSection, { items: [] })), "");
});
test("FAQ renders semantic native disclosure and escapes text rather than injecting HTML", async () => {
  const { TrustSupportSection } = await importComponent("src/components/sections/trust-support/TrustSupportSection.tsx");
  const html = renderToStaticMarkup(React.createElement(TrustSupportSection, { items: [{ question: "Test question", answer: "<script>alert('test')</script>" }] }));
  assert.match(html, /<details name="globows-faq">/);
  assert.match(html, /<summary>Test question<\/summary>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
