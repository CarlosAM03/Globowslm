import { strict as assert } from "node:assert";
import { execFile } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { createApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/credentials.js";
import { loadConfig } from "../../src/config.js";
import { DatabaseService } from "../../src/database.js";

const exec = promisify(execFile);

test("provisions, authenticates, revokes and recovers the only OWNER through real HTTP and PostgreSQL", async (t) => {
  const config = loadConfig(process.env);
  assert.equal(config.mode, "test");
  const dbUrl = new URL(config.databaseUrl);
  assert.equal(dbUrl.hostname, "db-qa");
  assert.equal(dbUrl.pathname, "/globows_qa");

  const db = new DatabaseService(config);
  t.after(() => db.onModuleDestroy());
  await db.$transaction([
    db.session.deleteMany(), db.owner.deleteMany(), db.loginChallenge.deleteMany(), db.rateLimitBucket.deleteMany(),
  ]);
  const ownerEmail = `owner-${randomUUID()}@example.invalid`;
  const passwd = randomBytes(30).toString("base64url");
  const recovered = randomBytes(30).toString("base64url");
  const cli = (action: string, password: string) => exec(
    process.execPath, [join(process.cwd(), "dist/src/auth/owner-cli.js"), action],
    { env: { ...process.env, HARNESS_OWNER_EMAIL: ownerEmail.toUpperCase(), HARNESS_OWNER_PASSWORD: password } },
  );

  assert.equal(JSON.parse((await cli("provision", passwd)).stdout).event, "owner_provisioned");
  await assert.rejects(cli("provision", passwd));
  const owners = await db.owner.findMany();
  assert.equal(owners.length, 1);
  assert.equal(owners[0].emailNormalized, ownerEmail);
  assert.match(owners[0].passwordHash, /^\$argon2id\$/);

  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  const api = `${await app.getUrl()}/api/v1/auth`;
  const origin = config.appOrigin;
  const challenge = async () => {
    const response = await fetch(`${api}/csrf`, { headers: { Origin: origin } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
    return (await response.json()).csrfToken as string;
  };
  const login = async (password: string, options: { email?: string; csrf?: string; origin?: string } = {}) =>
    fetch(`${api}/login`, {
      method: "POST",
      headers: {
        Origin: options.origin ?? origin,
        "Content-Type": "application/json",
        "X-Csrf-Token": options.csrf ?? await challenge(),
      },
      body: JSON.stringify({ email: options.email ?? ownerEmail, password }),
    });
  const session = (token: string) => fetch(`${api}/session`, { headers: { Authorization: `Bearer ${token}` } });

  assert.equal((await fetch(`${api}/session`)).status, 401);
  assert.equal((await fetch(`${api}/session`, { headers: { Cookie: "globows_owner=fixture" } })).status, 401);
  assert.equal((await login(passwd, { origin: "https://example.invalid" })).status, 403);
  assert.equal((await login(passwd, { csrf: "unissued-fixture" })).status, 403);

  const oneTime = await challenge();
  const invalid = await login("incorrecta", { csrf: oneTime });
  assert.equal(invalid.status, 401);
  const absent = await login("incorrecta", { email: "absent@example.invalid" });
  assert.equal(absent.status, 401);
  assert.equal((await invalid.json()).message, (await absent.json()).message);
  assert.equal((await login(passwd, { csrf: oneTime })).status, 403);

  const good = await login(passwd);
  assert.equal(good.status, 200);
  const credentials = await good.json();
  assert.deepEqual(credentials.owner, { id: owners[0].id, email: ownerEmail, role: "OWNER" });
  assert.match(credentials.sessionToken, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(good.headers.get("Set-Cookie"), null);
  const stored = await db.session.findUniqueOrThrow({ where: { tokenHash: hashToken(credentials.sessionToken) } });
  assert.notEqual(stored.tokenHash, credentials.sessionToken);
  assert.notEqual(stored.csrfHash, credentials.csrfToken);
  const sessionResponse = await session(credentials.sessionToken);
  assert.equal(sessionResponse.status, 200);
  assert.equal(sessionResponse.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await sessionResponse.json(), { owner: credentials.owner, csrfToken: credentials.csrfToken });

  const logout = (csrfToken: string, source = origin) => fetch(`${api}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${credentials.sessionToken}`, Origin: source, "X-Csrf-Token": csrfToken },
  });
  assert.equal((await logout("invalid-fixture")).status, 403);
  assert.equal((await logout(credentials.csrfToken, "https://example.invalid")).status, 403);
  assert.equal((await logout(credentials.csrfToken)).status, 200);
  assert.equal((await session(credentials.sessionToken)).status, 401);

  for (const state of ["idle", "absolute"]) {
    const response = await login(passwd);
    assert.equal(response.status, 200);
    const { sessionToken } = await response.json();
    const time = new Date(Date.now() - 31 * 60_000);
    await db.session.update({
      where: { tokenHash: hashToken(sessionToken) },
      data: state === "idle" ? { lastSeenAt: time } : { expiresAt: time },
    });
    assert.equal((await session(sessionToken)).status, 401);
  }
  const toRevoke = await (await login(passwd)).json();
  assert.equal(typeof toRevoke.sessionToken, "string");
  assert.equal((await login(passwd)).status, 429);

  assert.equal(JSON.parse((await cli("recover", recovered)).stdout).event, "owner_recovered");
  assert.equal((await session(toRevoke.sessionToken)).status, 401);
  await db.rateLimitBucket.deleteMany();
  assert.equal((await login(passwd)).status, 401);
  assert.equal((await login(recovered)).status, 200);
});
