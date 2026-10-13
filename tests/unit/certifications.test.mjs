import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getVerifiedCertifications, getTimelineScrollDistance, getTimelineScrollState } from "../../src/lib/certifications.ts";
import { importComponent } from "./render-component.mjs";

// Fictional data exists exclusively in this test; never imported by src/content.
const fixture = { id: "fixture-1", name: "Credencial de prueba", organization: "Organismo de prueba", verified: true, verificationSource: "Test fixture only" };
const { CertificationsSection } = await importComponent("src/components/sections/certifications/CertificationsSection.tsx");
test("empty content presents an editorial state without invented cards or controls", () => {
  const html = renderToStaticMarkup(React.createElement(CertificationsSection, { entries: [] }));
  assert.match(html, /Credenciales en validación/);
  assert.doesNotMatch(html, /certification-card|Certificación siguiente/);
});
test("valid credentials render semantic horizontal timeline and backed fields", () => {
  const html = renderToStaticMarkup(React.createElement(CertificationsSection, { entries: [fixture] }));
  assert.match(html, /Trayectoria de credenciales verificadas/);
  assert.match(html, /<ol class="timeline-list">/);
  assert.match(html, /Credencial de prueba/);
  assert.match(html, /Organismo de prueba/);
  assert.match(html, /Certificación anterior/);
  assert.match(html, /Certificación siguiente/);
  assert.doesNotMatch(html, /Credenciales en validación/);
});
test("unverified or incomplete entries are excluded", () => {
  assert.deepEqual(getVerifiedCertifications([fixture, { ...fixture, verified: false }, { ...fixture, name: " " }, { ...fixture, verificationSource: "" }]), [fixture]);
});
test("no unapproved image or fictional date is rendered", () => {
  const html = renderToStaticMarkup(React.createElement(CertificationsSection, { entries: [{ ...fixture, image: { src: "/unapproved.jpg", width: 100, height: 100, alt: "Pending", approval: "pending" } }] }));
  assert.doesNotMatch(html, /unapproved.jpg|<img|<time/);
});
test("timeline scroll boundaries govern previous and next controls", () => {
  assert.deepEqual(getTimelineScrollState(0, 320, 960), { previous: false, next: true });
  assert.deepEqual(getTimelineScrollState(320, 320, 960), { previous: true, next: true });
  assert.deepEqual(getTimelineScrollState(640, 320, 960), { previous: true, next: false });
  assert.deepEqual(getTimelineScrollState(0, 1000, 320), { previous: false, next: false });
});
test("next and previous advance one credential rather than skipping a desktop page", () => {
  assert.equal(getTimelineScrollDistance(300, 32, 1000), 332);
  assert.equal(getTimelineScrollDistance(272, 32, 272), 304);
  assert.equal(getTimelineScrollDistance(0, 32, 1000), 1000);
});
