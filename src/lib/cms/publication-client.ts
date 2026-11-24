import type { CmsDraft } from "@/types/cms/content";
import type { PageOf, Publication, PublicationState, Revision, RevisionDetail } from "@/types/cms/publications";
import { CmsRequestError } from "./content-client";
import type { ContentKind } from "./content-path";

async function read<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json();
  if (!response.ok) throw new CmsRequestError(response.status, data.message ?? "No se pudo completar la operación.");
  return data as T;
}

const historyUrl = (kind: ContentKind, id: string) => `/api/cms/admin/content/${kind}/${id}/revisions`;

export function listPublications(page: number, kind?: ContentKind, state?: PublicationState, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(page) });
  if (kind) query.set("kind", kind);
  if (state) query.set("state", state);
  return read<PageOf<Publication>>(`/api/cms/admin/publications?${query}`, { signal });
}

export function listRevisions(kind: ContentKind, id: string, page: number) {
  return read<PageOf<Revision>>(`${historyUrl(kind, id)}?page=${page}`);
}

export function readRevision(kind: ContentKind, id: string, revision: number) {
  return read<RevisionDetail>(`${historyUrl(kind, id)}/${revision}`);
}

export function restoreRevision(kind: ContentKind, row: Publication, revision: number, csrf: string) {
  return read<CmsDraft<object>>(`${historyUrl(kind, row.id)}/${revision}/restore`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: JSON.stringify({ version: row.version }),
  });
}
