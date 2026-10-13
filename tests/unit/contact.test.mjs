import test from "node:test";
import assert from "node:assert/strict";
import { getApprovedDestination } from "../../src/lib/contact.ts";

const channel = (id, destination, status = "approved") => ({ id, destination, status, label: id, source: "Test fixture only" });
test("candidate and missing channels never become links", () => {
  assert.equal(getApprovedDestination(channel("facebook", "https://www.facebook.com/globowslm", "candidate")), null);
  assert.equal(getApprovedDestination(channel("email", null, "missing")), null);
});
test("approved social destinations preserve the official HTTPS host", () => {
  for (const [id, url] of [["facebook", "https://www.facebook.com/globowslm"], ["instagram", "https://www.instagram.com/globows_lm/"], ["tiktok", "https://www.tiktok.com/@globows_liceymarquez"]]) assert.equal(getApprovedDestination(channel(id, url)), url);
});
test("rejects scripts, wrong hosts, insecure URLs and embedded credentials", () => {
  for (const url of ["javascript:alert(1)", "http://facebook.com/globowslm", "https://facebook.com.example.test/page", "https://person:password@facebook.com/page", "not a url"]) assert.equal(getApprovedDestination(channel("facebook", url)), null);
});
test("approved email is mailto, with no header or newline injection", () => {
  assert.equal(getApprovedDestination(channel("email", "contact@example.test")), "mailto:contact@example.test");
  for (const value of ["contact@example.test\n", "contact@example.test?bcc=other@example.test", "contact@example.test\r\nsubject:test"]) assert.equal(getApprovedDestination(channel("email", value)), null);
});
test("approved WhatsApp recipient is passed to the existing normalizer", () => {
  assert.equal(getApprovedDestination(channel("whatsapp", "+1 (202) 555-0100")), "+1 (202) 555-0100");
});
