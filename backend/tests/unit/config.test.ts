import { strict as assert } from "node:assert";
import { test } from "node:test";
import { loadConfig } from "../../src/config.js";

const env = {
  HARNESS_MODE: "test",
  DATABASE_URL: "postgresql://fixture:fixture@db-qa:5432/globows_qa",
  APP_ORIGIN: "http://web:3100",
  MEDIA_ROOT: "/tmp/globows-media",
};

test("loads an isolated test configuration", () => {
  assert.deepEqual(loadConfig(env), {
    mode: "test",
    databaseUrl: env.DATABASE_URL,
    port: 3101,
    appOrigin: "http://web:3100",
    mediaRoot: "/tmp/globows-media",
    videoLimitMiB: 100,
  });
});

test("requires HTTPS by default and disallows non-origin config", () => {
  assert.throws(() => loadConfig({ ...env, HARNESS_MODE: undefined }), /^Error: APP_ORIGIN/);
  const production = { ...env, HARNESS_MODE: "production", APP_ORIGIN: "https://example.invalid", CMS_BFF_SECRET: "a".repeat(43) };
  assert.equal(loadConfig(production).videoLimitMiB, 45);
  assert.throws(() => loadConfig({ ...production, MEDIA_VIDEO_LIMIT_MIB: "100" }), /^Error: MEDIA_VIDEO_LIMIT_MIB/);
  assert.throws(() => loadConfig({ ...production, CMS_BFF_SECRET: undefined }), /^Error: CMS_BFF_SECRET/);
  assert.throws(() => loadConfig({ ...env, APP_ORIGIN: "http://web:3100/admin" }), /^Error: APP_ORIGIN/);
});

test("rejects incomplete config without printing its values", () => {
  assert.throws(() => loadConfig({ ...env, DATABASE_URL: "invalid-fixture" }),
    (error: unknown) => error instanceof Error && error.message === "DATABASE_URL inválida");
  assert.throws(() => loadConfig({ ...env, HARNESS_MODE: "other" }), /^Error: HARNESS_MODE/);
  assert.throws(() => loadConfig({ ...env, PORT: "65536" }), /^Error: PORT/);
  assert.throws(() => loadConfig({ ...env, MEDIA_ROOT: "relative" }), /^Error: MEDIA_ROOT/);
  assert.throws(() => loadConfig({ ...env, MEDIA_ROOT: "/" }), /^Error: MEDIA_ROOT/);
});
