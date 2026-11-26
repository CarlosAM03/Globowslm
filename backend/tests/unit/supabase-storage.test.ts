import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { text } from "node:stream/consumers";
import { test } from "node:test";
import { SupabaseStorage } from "../../src/supabase-storage.js";

test("private storage adapter verifies bucket, streams ranges, rejects faults and deletes idempotently", async (t) => {
  const filename = "00000000-0000-4000-8000-000000000001.webp";
  const fixture = Buffer.alloc(132_099, "upload fixture");
  const key = "fixture-storage";
  let saved: Buffer | undefined;
  let makePublic = false;
  let maskRange = false;
  let full = false;
  let redirects = false;
  const server = createServer(async (req, res) => {
    const sendJson = (status: number, body: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(body));
    };
    if (req.headers.apikey !== key || req.headers.authorization) return sendJson(403, {});
    if (req.url === "/storage/v1/bucket/private-media") {
      return sendJson(200, { public: makePublic, file_size_limit: 45 * 1024 ** 2,
        allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"] });
    }
    if (req.url === `/storage/v1/object/info/authenticated/private-media/${filename}`) {
      return saved ? sendJson(200, { size: saved.length }) : sendJson(400, { statusCode: "404" });
    }
    if (req.url === "/storage/v1/object/list/private-media") {
      await text(req);
      return sendJson(200, saved ? [{ name: filename, metadata: { size: saved.length }, updated_at: "2026-09-01T00:00:00Z" }] : []);
    }
    if (req.url === `/storage/v1/object/private-media/${filename}`) {
      if (req.method === "POST") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        if (full) return sendJson(413, { message: "quota" });
        if (saved || req.headers["x-upsert"] !== "false" || req.headers["content-length"] !== String(fixture.length)) {
          return sendJson(409, {});
        }
        saved = Buffer.concat(chunks);
        return sendJson(200, {});
      }
      if (req.method === "DELETE") {
        if (!saved) return sendJson(404, {});
        saved = undefined;
        return sendJson(200, {});
      }
    }
    if (req.url === `/storage/v1/object/authenticated/private-media/${filename}` && saved) {
      if (redirects) return res.writeHead(302, { Location: "/bad-target" }).end();
      if (!maskRange && req.headers.range === "bytes=3-15") {
        return res.writeHead(206, { "Content-Length": 13, "Content-Range": `bytes 3-15/${saved.length}` }).end(saved.subarray(3, 16));
      }
      return res.writeHead(200, { "Content-Length": saved.length }).end(saved);
    }
    return sendJson(404, {});
  });
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const storage = new SupabaseStorage({ origin: `http://127.0.0.1:${address.port}`, bucket: "private-media", key });
  const root = await mkdtemp(join(tmpdir(), "globows-storage-http-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const temporary = join(root, "fixture.img");
  await writeFile(temporary, fixture);

  assert.equal(await storage.isReady(), true);
  makePublic = true;
  assert.equal(await storage.isReady(), false);
  makePublic = false;
  assert.equal(await storage.size(filename), null);
  full = true;
  await assert.rejects(storage.write(filename, temporary, "image/webp", fixture.length));
  assert.equal(await storage.size(filename), null);
  full = false;
  await storage.write(filename, temporary, "image/webp", fixture.length);
  await assert.rejects(storage.write(filename, temporary, "image/webp", fixture.length));
  assert.equal(await storage.size(filename), fixture.length);
  const objects = [];
  for await (const object of storage.entries()) objects.push(object);
  assert.deepEqual(objects, [{
    name: filename, size: fixture.length, updatedAt: Date.parse("2026-09-01T00:00:00Z"),
  }]);
  const stream = await storage.read(filename, fixture.length);
  assert.ok(stream);
  const digest = createHash("sha256");
  for await (const chunk of stream) digest.update(chunk);
  assert.equal(digest.digest("hex"), createHash("sha256").update(fixture).digest("hex"));
  const range = await storage.read(filename, fixture.length, { start: 3, end: 15 });
  assert.ok(range);
  assert.equal(await text(range), fixture.subarray(3, 16).toString());
  maskRange = true;
  await assert.rejects(storage.read(filename, fixture.length, { start: 3, end: 15 }));
  redirects = true;
  await assert.rejects(storage.read(filename, fixture.length));
  await storage.remove(filename);
  await storage.remove(filename);
  assert.equal(await storage.size(filename), null);
});
