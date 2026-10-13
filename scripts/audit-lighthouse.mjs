import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.QA_BASE_URL ?? "http://127.0.0.1:3100";
const phase = process.argv[2] ?? "final";
if (!/^[a-z0-9-]+$/.test(phase)) throw new Error("Invalid evidence label");
const output = path.resolve(".visual-evidence", "lighthouse", phase);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ args: ["--remote-debugging-port=9223"] });
try {
  const summary = [];
  for (const formFactor of ["mobile", "desktop"]) {
    const result = await lighthouse(url, { port: 9223, output: ["json", "html"], logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] }, {
      extends: "lighthouse:default",
      settings: { formFactor, ...(formFactor === "desktop" ? { screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } } : {}) },
    });
    if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError));
    const lhr = result.lhr;
    await writeFile(path.join(output, `${formFactor}.json`), result.report[0]);
    await writeFile(path.join(output, `${formFactor}.html`), result.report[1]);
    summary.push({ date: lhr.fetchTime, url: lhr.finalDisplayedUrl, lighthouse: lhr.lighthouseVersion, node: process.version, platform: process.platform, formFactor, settings: lhr.configSettings, scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])), metrics: Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time", "speed-index", "total-byte-weight"].map((id) => [id, { value: lhr.audits[id]?.numericValue, display: lhr.audits[id]?.displayValue }])), defects: Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 1).map((a) => ({ id: a.id, title: a.title, score: a.score, display: a.displayValue })) });
  }
  await writeFile(path.join(output, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary.map(({ formFactor, scores, metrics }) => ({ formFactor, scores, metrics })), null, 2));
} finally { await browser.close(); }
