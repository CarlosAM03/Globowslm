import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("manual carousel handles limits, keyboard and category reset", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto("/#galeria");
  const viewport = page.locator("#gallery-results"), next = page.getByRole("button", { name: "Fotografía siguiente" }), previous = page.getByRole("button", { name: "Fotografía anterior" });
  await expect(previous).toBeDisabled(); await expect(next).toBeEnabled();
  await next.click(); await expect(previous).toBeEnabled();
  await viewport.focus(); await page.keyboard.press("End"); await expect(next).toBeDisabled();
  await page.keyboard.press("ArrowLeft"); await expect(next).toBeEnabled();
  await page.keyboard.press("Home"); await expect(previous).toBeDisabled();
  await page.getByRole("button", { name: "Baby Shower", exact: true }).click();
  await expect(previous).toBeDisabled(); await expect(next).toBeDisabled();
  expect(await viewport.evaluate(el => el.scrollLeft)).toBe(0);
  await page.getByRole("button", { name: "Todas", exact: true }).click();
  await expect(next).toBeEnabled(); expect(await viewport.evaluate(el => el.scrollLeft)).toBe(0);
  await page.waitForTimeout(500); expect(await viewport.evaluate(el => el.scrollLeft)).toBe(0);
});

test("carousel works on a touch viewport without page overflow", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage(); await page.goto("http://127.0.0.1:3100/#galeria");
  await page.getByRole("button", { name: "Fotografía siguiente" }).tap();
  await expect.poll(() => page.locator("#gallery-results").evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await context.close();
});

test("approved FAQ is operable by keyboard with one answer expanded", async ({ page }) => {
  await page.goto("/#confianza"); const summaries=page.locator("#confianza summary"); await expect(summaries).toHaveCount(3);
  await summaries.first().focus(); await page.keyboard.press("Enter"); await expect(page.locator("#confianza details[open]")).toHaveCount(1);
  await expect(page.locator("#confianza details[open]")).toContainText("1–2 meses");
  await summaries.nth(1).focus(); await page.keyboard.press("Space"); await expect(page.locator("#confianza details[open]")).toHaveCount(1); await expect(page.locator("#confianza details[open]")).toContainText("todos los niveles");
});

test("contextual WhatsApp and approved social links open their exact destinations without sending messages", async ({ page, context }) => {
  await page.goto("/");
  const links=page.locator('a[href^="https://wa.me/"]'); expect(await links.count()).toBeGreaterThanOrEqual(12);
  for(const link of await links.all()) { const url=new URL((await link.getAttribute("href"))!); expect(url.pathname).toBe("/5216644846470"); expect(url.searchParams.get("text")).toBeTruthy(); await expect(link).toHaveAttribute("target","_blank"); await expect(link).toHaveAttribute("rel",/noopener/); }
  for(const [name,href] of [["Facebook","https://www.facebook.com/globowslm"],["Instagram","https://www.instagram.com/globows_lm/"],["TikTok","https://www.tiktok.com/@globows_liceymarquez"]]) await expect(page.locator("#contacto").getByRole("link",{name:new RegExp(name)})).toHaveAttribute("href",href);
  // Intercept only in this test: verify real browser target navigation, no commercial request.
  await context.route("https://wa.me/**", route => route.fulfill({ status:200, contentType:"text/html", body:"<title>Navigation assertion</title>" }));
  const pending=page.waitForEvent("popup"); await page.locator("#inicio .button").first().click(); const popup=await pending; await popup.waitForLoadState(); expect(new URL(popup.url()).pathname).toBe("/5216644846470"); await popup.close();
});

test("release metadata and security headers retain noindex", async ({ page, request }) => {
  const response=await page.goto("/"); const headers=response!.headers(); expect(headers["x-content-type-options"]).toBe("nosniff"); expect(headers["x-frame-options"]).toBe("DENY"); expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'"); expect(headers["x-robots-tag"]).toContain("noindex");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content",/Globows/); await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content","summary_large_image"); await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  const robots=await request.get("/robots.txt"); expect(robots.status()).toBe(200); expect(await robots.text()).toContain("Allow: /");
  const sitemap=await request.get("/sitemap.xml"); expect(sitemap.status()).toBe(200); expect(await sitemap.text()).not.toContain("<loc>");
});

for (const width of [375, 1440]) test(`axe WCAG AA analysis at ${width}px including interactive states`, async ({ page }, testInfo) => {
  await page.setViewportSize({width,height:900}); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  for(const state of ["closed","floating","faq"]) {
    if(state === "floating") await page.getByRole("button",{name:"Abrir canales de contacto"}).click();
    if(state === "faq") { await page.keyboard.press("Escape"); await page.locator("#confianza summary").first().click(); }
    const results=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]).analyze();
    await testInfo.attach(`axe-${width}-${state}`,{body:JSON.stringify({violations:results.violations,incomplete:results.incomplete,passes:results.passes.length},null,2),contentType:"application/json"});
    expect(results.violations).toEqual([]);
  }
});
