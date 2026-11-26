import { strict as assert } from "node:assert";
import { execFile } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { createApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/credentials.js";
import { EditorialService } from "../../src/editorial/editorial.js";
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
  assert.equal(JSON.parse((await cli("provision", passwd)).stdout).event, "owner_already_provisioned");
  await assert.rejects(cli("provision", recovered));
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

  const dashboardUrl = `${api.replace(/auth$/, "")}admin/dashboard`;
  assert.equal((await fetch(dashboardUrl)).status, 401);
  const dashboard = async () => {
    const response = await fetch(dashboardUrl, { headers: { Authorization: `Bearer ${credentials.sessionToken}` } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    return response.json();
  };
  const before = await dashboard();
  const cms = app.get(EditorialService);
  const own = { actorId: owners[0].id, requestId: randomUUID() };
  const outsider = { actorId: randomUUID(), requestId: randomUUID() };
  const create = (who: typeof own) => cms.create("EVENT_TYPE", {
    slug: `dashboard-${randomUUID()}`, payload: { title: "Fixture local" },
  }, who);
  const draft = await create(own);
  const publication = await create(own);
  await cms.transition(publication, publication.version, "PUBLISH", own);
  const removed = await create(outsider);
  const publishedForWithdrawal = await cms.transition(removed, removed.version, "PUBLISH", outsider);
  await cms.transition(removed, publishedForWithdrawal.version, "WITHDRAW", outsider);
  const updated = await dashboard();
  assert.deepEqual(updated.totals, {
    draft: before.totals.draft + 1,
    published: before.totals.published + 1,
    withdrawn: before.totals.withdrawn + 1,
  });
  assert.ok(updated.byKind.some((row: { kind: string }) => row.kind === "EVENT_TYPE"));
  assert.ok(updated.recent.some((row: { entityId: string }) => row.entityId === draft.id));
  assert.ok(updated.recent.every((row: { entityId: string }) => row.entityId !== removed.id));

  const siteUrl = `${api.replace(/auth$/, "")}admin/content/site`;
  assert.equal((await fetch(siteUrl)).status, 401);
  const authHeaders = { Authorization: `Bearer ${credentials.sessionToken}` };
  const writes = { ...authHeaders, Origin: origin, "Content-Type": "application/json", "X-Csrf-Token": credentials.csrfToken };
  const sendSite = (url: string, method: string, body: object, headers = writes) =>
    fetch(url, { method, headers, body: JSON.stringify(body) });
  const sitePayload = {
    brandName: "Fixture institucional", founderName: "Propietaria de prueba",
    hero: { title: "Presentación" }, about: { title: "Historia", history: "Texto de prueba" },
    contact: {}, faq: [], seo: { title: "Fixture SEO", description: "Descripción de prueba" },
  };
  const siteInput = { slug: "site", position: 0, payload: sitePayload };
  const listed = await (await fetch(siteUrl, { headers: authHeaders })).json();
  const existing = listed.items[0];
  const target = existing ? `${siteUrl}/${existing.id}` : siteUrl;
  const method = existing ? "PATCH" : "POST";
  const writeBody = existing ? { ...siteInput, version: existing.version } : siteInput;
  assert.equal((await sendSite(target, method, writeBody, { ...writes, "X-Csrf-Token": "" })).status, 403);
  const invalidSite = await sendSite(target, method, {
    ...writeBody, payload: { ...sitePayload, contact: { facebook: "https://example.invalid/perfil" } },
  });
  assert.equal(invalidSite.status, 422);
  assert.ok((await invalidSite.json()).fieldErrors["contact.facebook"]);
  const savedSite = await sendSite(target, method, writeBody);
  assert.equal(savedSite.status, existing ? 200 : 201);
  const saved = await savedSite.json();
  assert.deepEqual(saved.payload.contact, {});
  const detailUrl = `${siteUrl}/${saved.id}`;
  const publishResponse = await sendSite(`${detailUrl}/publish`, "POST", { version: saved.version });
  assert.equal(publishResponse.status, 200);
  const currentSite = await publishResponse.json();
  const snapshot = await cms.published("SITE", "site");
  assert.deepEqual(snapshot?.payload, sitePayload);
  const changed = { ...siteInput, version: currentSite.version, payload: { ...sitePayload, brandName: "Borrador nuevo" } };
  const edits = await Promise.all([sendSite(detailUrl, "PATCH", changed), sendSite(detailUrl, "PATCH", changed)]);
  assert.deepEqual(edits.map((result) => result.status).sort(), [200, 409]);
  const preview = await fetch(`${detailUrl}/preview`, { headers: authHeaders });
  assert.equal(preview.headers.get("Cache-Control"), "no-store");
  assert.equal((await preview.json()).payload.brandName, "Borrador nuevo");
  assert.deepEqual(await cms.published("SITE", "site"), snapshot);

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

test("enforces both singleton roles and revokes only the account that changes credentials", async (t) => {
  const config = loadConfig(process.env);
  assert.equal(config.mode, "test");
  assert.equal(new URL(config.databaseUrl).hostname, "db-qa");
  const db = new DatabaseService(config);
  t.after(() => db.onModuleDestroy());
  await db.$transaction([db.session.deleteMany(), db.owner.deleteMany(), db.rateLimitBucket.deleteMany()]);

  const owner = { email: "rbac-owner@example.invalid", password: randomBytes(30).toString("base64url") };
  const admin = { email: "rbac-admin@example.invalid", password: randomBytes(30).toString("base64url") };
  const cli = (action: string, role: "ADMIN" | "OWNER", password: string, address: string) => exec(
    process.execPath, [join(process.cwd(), "dist/src/auth/owner-cli.js"), action, role],
    { env: { ...process.env, [`HARNESS_${role}_EMAIL`]: address, [`HARNESS_${role}_PASSWORD`]: password } },
  );
  await cli("provision", "OWNER", owner.password, owner.email);
  await assert.rejects(cli("provision", "ADMIN", owner.password, admin.email));
  await assert.rejects(cli("provision", "ADMIN", admin.password, owner.email.toUpperCase()));
  const races = await Promise.allSettled([
    cli("provision", "ADMIN", admin.password, admin.email),
    cli("provision", "ADMIN", admin.password, admin.email.toUpperCase()),
  ]);
  const events = races.flatMap((result) => result.status === "fulfilled" ? [JSON.parse(result.value.stdout).event] : []);
  assert.deepEqual(events.sort(), ["admin_already_provisioned", "admin_provisioned"]);
  await assert.rejects(cli("provision", "ADMIN", admin.password, "other@example.invalid"));
  const accounts = await db.owner.findMany({ orderBy: { role: "asc" } });
  assert.deepEqual(accounts.map((row) => row.role), ["OWNER", "ADMIN"]);
  await assert.rejects(db.owner.create({ data: {
    role: "ADMIN", singleton: null, emailNormalized: "other@example.invalid", passwordHash: accounts[0].passwordHash,
  } }));

  const app = await createApp();
  t.after(() => app.close());
  await app.listen(0, "127.0.0.1");
  const api = `${await app.getUrl()}/api/v1`;
  const Origin = config.appOrigin;
  const login = async (account: object) => {
    const challenge = await fetch(`${api}/auth/csrf`, { headers: { Origin } });
    assert.equal(challenge.status, 200);
    return fetch(`${api}/auth/login`, {
      method: "POST", headers: { Origin, "Content-Type": "application/json", "X-CSRF-Token": (await challenge.json()).csrfToken },
      body: JSON.stringify(account),
    });
  };
  const credentials = async (account: object) => {
    const result = await login(account);
    assert.equal(result.status, 200);
    return result.json() as Promise<{ sessionToken: string; csrfToken: string; owner: { id: string; role: string } }>;
  };
  assert.equal((await login({ ...owner, role: "ADMIN" })).status, 400);
  const ownerSession = await credentials(owner);
  const adminSession = await credentials(admin);
  assert.equal(ownerSession.owner.role, "OWNER");
  assert.equal(adminSession.owner.role, "ADMIN");
  const get = (path: string, token?: string) => fetch(`${api}/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  assert.equal((await get("admin/diagnostics")).status, 401);
  assert.equal((await get("admin/diagnostics", ownerSession.sessionToken)).status, 403);
  assert.equal((await get("admin/dashboard", ownerSession.sessionToken)).status, 200);
  assert.equal((await get("admin/dashboard", adminSession.sessionToken)).status, 200);
  const postPassword = (newPassword: string, csrf = adminSession.csrfToken, expectedOrigin = Origin) =>
    fetch(`${api}/auth/password`, {
      method: "POST",
      headers: {
        Origin: expectedOrigin, "Content-Type": "application/json", "X-CSRF-Token": csrf,
        Authorization: `Bearer ${adminSession.sessionToken}`,
      },
      body: JSON.stringify({ currentPassword: admin.password, newPassword }),
    });
  const next = randomBytes(30).toString("base64url");
  assert.equal((await postPassword(next, ownerSession.csrfToken)).status, 403);
  assert.equal((await postPassword(next, adminSession.csrfToken, "https://example.invalid")).status, 403);
  assert.equal((await postPassword(owner.password)).status, 400);
  assert.equal((await postPassword(next)).status, 200);
  assert.equal((await get("auth/session", adminSession.sessionToken)).status, 401);
  assert.equal((await get("auth/session", ownerSession.sessionToken)).status, 200);
  assert.equal((await login(admin)).status, 401);
  const renewed = await credentials({ ...admin, password: next });
  const diagnostic = await get("admin/diagnostics", renewed.sessionToken);
  assert.equal(diagnostic.status, 200);
  assert.equal(diagnostic.headers.get("Cache-Control"), "no-store");
  const report = await diagnostic.json();
  assert.ok(report.audit.some((event: { actorId: string; action: string }) =>
    event.actorId === renewed.owner.id && event.action === "PASSWORD_CHANGED"));
  assert.doesNotMatch(JSON.stringify(report), /passwordHash|csrfHash|emailNormalized|sessionToken/);
  await cli("recover", "ADMIN", randomBytes(30).toString("base64url"), admin.email);
  assert.equal((await get("auth/session", renewed.sessionToken)).status, 401);
  assert.equal((await get("auth/session", ownerSession.sessionToken)).status, 200);
});
