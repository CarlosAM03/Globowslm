import assert from "node:assert/strict";
import test from "node:test";
import { resolveAuthAction } from "../../src/lib/cms/auth-path.ts";
import { resolveContentPath } from "../../src/lib/cms/content-path.ts";
import { parseMediaOrigin } from "../../src/lib/cms/media-origin.ts";
import { resolveMediaPath } from "../../src/lib/cms/media-path.ts";
import { publishedImageWidth } from "../../src/lib/cms/published-image.ts";

const id = "9700c616-2daa-44d1-86c3-57c3861fdb91";

test("BFF resolves only declared operation, method, UUID and revision", () => {
  assert.equal(resolveAuthAction(["auth", "session"], "GET"), "session");
  assert.equal(resolveAuthAction(["auth", "session"], "POST"), null);
  assert.equal(resolveAuthAction(["auth", "fixture"], "GET"), null);
  assert.equal(resolveContentPath(["post", id, "revisions", "1", "restore"], "POST"),
    `admin/content/post/${id}/revisions/1/restore`);
  assert.equal(resolveContentPath(["post", id, "revisions", "1", "restore"], "GET"), null);
  assert.equal(resolveContentPath(["post", id, "revisions", "2147483648"], "GET"), null);
  assert.equal(resolveContentPath(["post", "fixture", "preview"], "GET"), null);
  assert.equal(resolveContentPath(["public", id], "GET"), null);
  assert.equal(resolveMediaPath([id, "preview-ticket"], "POST"), `admin/media/${id}/preview-ticket`);
  assert.equal(resolveMediaPath([id, "preview-ticket"], "GET"), null);
  assert.equal(resolveMediaPath(["upload-ticket"], "GET"), null);
});

test("media origin and dimensions use a limited, explicit grammar", () => {
  const remoteApp = "https://editor.example.invalid";
  assert.equal(parseMediaOrigin("https://media.example.invalid", remoteApp), "https://media.example.invalid");
  assert.throws(() => parseMediaOrigin("http://media.example.invalid", remoteApp));
  assert.throws(() => parseMediaOrigin("https://media.example.invalid/library", remoteApp));
  assert.throws(() => parseMediaOrigin("http://outside.example.invalid", "http://127.0.0.1:3100"));
  assert.equal(publishedImageWidth("828"), 828);
  assert.equal(publishedImageWidth("0828"), undefined);
  assert.equal(publishedImageWidth("99999"), undefined);
});
