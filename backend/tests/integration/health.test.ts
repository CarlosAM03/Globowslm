import { strict as assert } from "node:assert";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { createApp } from "../../src/app.js";

async function server(t: TestContext, overrides: NodeJS.ProcessEnv = {}): Promise<string> {
  assert.equal(process.env.HARNESS_MODE, "test");
  const path = await mkdtemp(join(tmpdir(), "globows-api-"));
  t.after(() => rm(path, { recursive: true, force: true }));
  const settings = { MEDIA_ROOT: path, ...overrides };
  const saved = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(settings)) {
    saved.set(key, process.env[key]);
    if (value !== undefined) process.env[key] = value;
  }
  try {
    const app = await createApp();
    t.after(() => app.close());
    await app.listen(0, "127.0.0.1");
    return `${await app.getUrl()}/api/v1`;
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("liveness and readiness use real PostgreSQL and writable storage", async (t) => {
  const api = await server(t);
  const live = await fetch(`${api}/health/live`);
  assert.equal(live.status, 200);
  assert.equal(live.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await live.json(), { status: "live" });
  const ready = await fetch(`${api}/health/ready`);
  assert.equal(ready.status, 200);
  assert.deepEqual(await ready.json(), { status: "ready" });
});

test("readiness rejects an unavailable database while liveness stays healthy", async (t) => {
  const api = await server(t, { DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1:1/globows_qa" });
  const ready = await fetch(`${api}/health/ready`);
  assert.equal(ready.status, 503);
  assert.deepEqual(await ready.json(), {
    code: "NOT_READY",
    message: "Servicio temporalmente indisponible.",
    requestId: ready.headers.get("X-Request-Id"),
  });
  const live = await fetch(`${api}/health/live`);
  assert.equal(live.status, 200);
  await live.text();
});

test("readiness rejects a storage path that is not a directory", async (t) => {
  const path = await mkdtemp(join(tmpdir(), "globows-storage-"));
  t.after(() => rm(path, { recursive: true, force: true }));
  const file = join(path, "fixture");
  await writeFile(file, "fixture");
  const api = await server(t, { MEDIA_ROOT: file });
  const response = await fetch(`${api}/health/ready`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "NOT_READY");
});

test("authentication bootstrap accepts only the configured BFF credential", async (t) => {
  const secret = "a".repeat(43);
  const api = await server(t, { CMS_BFF_SECRET: secret });
  const Origin = process.env.APP_ORIGIN ?? "";
  assert.equal((await fetch(`${api}/auth/csrf`, { headers: { Origin } })).status, 403);
  assert.equal((await fetch(`${api}/auth/csrf`, { headers: { Origin, "X-Cms-Bff": "b".repeat(43) } })).status, 403);
  const response = await fetch(`${api}/auth/csrf`, { headers: { Origin, "X-Cms-Bff": secret } });
  assert.equal(response.status, 200);
  const { csrfToken } = await response.json();
  const login = await fetch(`${api}/auth/login`, {
    method: "POST", headers: { Origin, "X-CSRF-Token": csrfToken, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "fixture@example.invalid", password: "invalid-fixture" }),
  });
  assert.equal(login.status, 403);
});

test("OpenAPI describes both probes and errors while unknown routes are sanitized", async (t) => {
  const api = await server(t);
  const specResponse = await fetch(`${api}/openapi.json`);
  assert.equal(specResponse.status, 200);
  const spec = await specResponse.json();
  assert.match(spec.openapi, /^3\./);
  assert.ok(spec.paths["/api/v1/health/live"].get.responses["200"]);
  assert.ok(spec.paths["/api/v1/health/ready"].get.responses["503"]);
  assert.equal(spec.components.schemas.ApiError.properties.requestId.format, "uuid");
  assert.ok(spec.paths["/api/v1/auth/password"].post.requestBody.content["application/json"]);
  assert.deepEqual(spec.paths["/api/v1/auth/session"].get.responses["200"].content["application/json"].schema.properties.owner.properties.role.enum, ["OWNER", "ADMIN"]);
  assert.ok(spec.paths["/api/v1/admin/diagnostics"].get.responses["403"]);
  const admin = spec.paths["/api/v1/admin/content/{kind}"].post;
  assert.deepEqual(admin.security, [{ ownerSession: [] }]);
  assert.ok(admin.parameters.some((parameter: { name: string }) => parameter.name === "X-CSRF-Token"));
  assert.ok(admin.requestBody.content["application/json"].schema.properties.payload.anyOf.length >= 9);
  assert.ok(spec.components.schemas.EditorialPayload_POST.properties.blocks);
  const upload = spec.paths["/api/v1/media/upload"].post;
  assert.deepEqual(upload.security, [{ uploadTicket: [] }]);
  assert.equal(upload.requestBody.content["video/mp4"].schema.format, "binary");
  assert.ok(spec.paths["/api/v1/media/public/{id}"].get.responses["206"]);

  const response = await fetch(`${api}/unregistered`, { headers: { "X-Request-Id": "invalid-fixture" } });
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.deepEqual(Object.keys(body).sort(), ["code", "message", "requestId"]);
  assert.equal(body.code, "NOT_FOUND");
  assert.match(body.requestId, /^[0-9a-f-]{36}$/);
  assert.equal(response.headers.get("X-Request-Id"), body.requestId);
});
