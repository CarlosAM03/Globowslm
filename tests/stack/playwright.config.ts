import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  workers: 1,
  forbidOnly: true,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { ...devices["Desktop Chrome"], baseURL: "http://web:3100", trace: "off", screenshot: "off" },
});
