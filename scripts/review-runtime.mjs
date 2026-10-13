import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.QA_BASE_URL ?? "http://127.0.0.1:3100";
const label = process.argv[2] ?? "local";
if (!/^[a-z0-9-]+$/.test(label)) throw new Error("Invalid evidence label");
const directory = path.resolve(".visual-evidence/runtime", label);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const evidence = [];
try {
  for (const width of [375, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 900 }, reducedMotion: "reduce" });
    const errors = [], failedRequests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("requestfailed", request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    const response = await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    if (!(await page.locator("#inicio").count())) {
      evidence.push({ requestedUrl: url, finalOrigin: new URL(page.url()).origin, title: await page.title(), width, state: "Application unavailable or protected" });
      await page.close(); continue;
    }
    await page.evaluate(() => {
      window.qaInteractionDurations = [];
      if (PerformanceObserver.supportedEntryTypes.includes("event")) new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (entry.interactionId) window.qaInteractionDurations.push(entry.duration);
      }).observe({ type: "event", buffered: true, durationThreshold: 16 });
    });
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.complete ? undefined : new Promise(resolve => { image.onload = resolve; image.onerror = resolve; }));
    }
    await page.locator("#gallery-results").evaluate(element => element.scrollTo({ left: 0, behavior: "instant" }));
    await page.getByRole("button", { name: "Fotografía siguiente" }).click();
    await page.getByRole("button", { name: "Baby Shower", exact: true }).click();
    await expect(page.locator("#gallery-results figure")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Fotografía siguiente" })).toBeDisabled();
    const singleImageCorrect = await page.locator("#gallery-results figure").count() === 1 && await page.getByRole("button", { name: "Fotografía siguiente" }).isDisabled();
    await page.getByRole("button", { name: "Todas", exact: true }).click();
    await page.locator("#confianza summary").first().click();
    const faqOperable = await page.locator("#confianza details[open]").count() === 1;
    await page.locator("#confianza summary").first().click();
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    if (width === 375) {
      const menu = page.locator('button[aria-controls="mobile-navigation"]');
      await menu.focus(); await page.keyboard.press("Enter"); await page.keyboard.press("Escape");
      if (await menu.getAttribute("aria-expanded") !== "false") throw new Error("Mobile menu did not close");
    }
    const floating = page.locator(".floating-trigger");
    await floating.focus(); await page.keyboard.press("Enter");
    await page.screenshot({ path: path.join(directory, `floating-open-${width}.png`) });
    await page.keyboard.press("Escape");
    await page.screenshot({ path: path.join(directory, `landing-${width}.png`), fullPage: true });
    const data = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, images: [...document.querySelectorAll("main img")].map(image => ({ loaded: image.complete && image.naturalWidth > 0, currentSrc: image.currentSrc })), brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.getElementById(link.getAttribute("href").slice(1))).map(link => link.getAttribute("href")), samples: window.qaInteractionDurations }));
    evidence.push({ date: new Date().toISOString(), requestedUrl: url, width, status: response.status(), title: await page.title(), noindex: (await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex"), singleImageCorrect, faqOperable, headers: Object.fromEntries(Object.entries(response.headers()).filter(([key]) => ["content-security-policy", "x-robots-tag", "x-content-type-options", "x-frame-options"].includes(key))), errors, failedRequests, ...data });
    if (errors.length || data.overflow || data.brokenAnchors.length || data.images.some(image => !image.loaded) || !singleImageCorrect || !faqOperable) throw new Error(`Runtime verification failed at ${width}px`);
    await page.close();
  }
} finally {
  await writeFile(path.join(directory, "summary.json"), JSON.stringify(evidence, null, 2));
  await browser.close();
}
console.log(JSON.stringify(evidence.map(({ width, status, errors, overflow, state, samples }) => ({ width, status, errors, overflow, state, samples })), null, 2));
