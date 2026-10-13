import test from "node:test";
import assert from "node:assert/strict";
import { getCarouselState, getCarouselStep } from "../../src/lib/carousel.ts";

test("one photograph fitting the viewport has no redundant navigation", () => {
  assert.deepEqual(getCarouselState(0, 300, 300), { previous: false, next: false });
});
test("manual carousel has correct beginning, middle and end bounds", () => {
  assert.deepEqual(getCarouselState(0, 300, 1000), { previous: false, next: true });
  assert.deepEqual(getCarouselState(332, 300, 1000), { previous: true, next: true });
  assert.deepEqual(getCarouselState(700, 300, 1000), { previous: true, next: false });
  assert.deepEqual(getCarouselState(-10, 300, 1000), { previous: false, next: true });
  assert.deepEqual(getCarouselState(1001, 300, 1000), { previous: true, next: false });
});
test("previous and next advance one actual card including its gap", () => {
  assert.equal(getCarouselStep(300, 32, 1000), 332);
  assert.equal(getCarouselStep(0, 32, 300), 300);
});
