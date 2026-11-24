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
  });
});

test("requires HTTPS by default and disallows non-origin config", () => {
  assert.throws(() => loadConfig({ ...env, HARNESS_MODE: undefined }), /^Error: APP_ORIGIN/);
  assert.equal(loadConfig({ ...env, HARNESS_MODE: "production", APP_ORIGIN: "https://example.invalid" }).mode, "production");
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
