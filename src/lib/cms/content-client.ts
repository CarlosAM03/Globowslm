import type { CmsDraft, CmsList } from "@/types/cms/content";
import type { ContentKind } from "./content-path";

export class CmsRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

async function json<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new CmsRequestError(response.status, data.message ?? "No se pudo completar la operación.", data.fieldErrors);
  return data as T;
}

const contentUrl = (kind: ContentKind, id?: string, action?: string) =>
  ["/api/cms/admin/content", kind, id, action].filter(Boolean).join("/");

export function listContent<T>(kind: ContentKind, signal?: AbortSignal, page = 1) {
  return json<CmsList<T>>(`${contentUrl(kind)}?page=${page}`, { signal });
}

export function previewContent<T>(kind: ContentKind, id: string) {
  return json<CmsDraft<T>>(contentUrl(kind, id, "preview"), {});
}

export function writeDraft<T>(
  kind: ContentKind,
  draft: Pick<CmsDraft<T>, "slug" | "position" | "payload">,
  csrf: string,
  existing?: Pick<CmsDraft<T>, "id" | "version">,
) {
  return json<CmsDraft<T>>(contentUrl(kind, existing?.id), {
    method: existing ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: JSON.stringify({ ...draft, ...(existing && { version: existing.version }) }),
  });
}

export function publishContent<T>(kind: ContentKind, draft: Pick<CmsDraft<T>, "id" | "version">, csrf: string) {
  return json<CmsDraft<T>>(contentUrl(kind, draft.id, "publish"), {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: JSON.stringify({ version: draft.version }),
  });
}
