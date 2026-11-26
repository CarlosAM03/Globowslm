export const enabledContent = ["site", "service", "event_type", "gallery", "gallery_category", "training", "certification", "post", "blog_category"] as const;
export type ContentKind = typeof enabledContent[number];
export const contentActions = ["publish", "withdraw", "archive", "restore"] as const;
export type ContentAction = typeof contentActions[number];
export type ContentEndpoint =
  | `admin/content/${ContentKind}`
  | `admin/content/${ContentKind}/${string}`
  | `admin/content/${ContentKind}/${string}/${"preview" | "revisions" | ContentAction}`
  | `admin/content/${ContentKind}/${string}/revisions/${number}`
  | `admin/content/${ContentKind}/${string}/revisions/${number}/restore`;

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function resolveContentPath(parts: readonly string[], method: string): ContentEndpoint | null {
  const [kind, id, action, revision, operation] = parts;
  if (!enabledContent.some((allowed) => allowed === kind)) return null;
  const route = `admin/content/${kind as ContentKind}` as const;
  if (parts.length === 1 && (method === "GET" || method === "POST")) return route;
  if (!uuid.test(id ?? "")) return null;
  if (parts.length === 2 && (method === "GET" || method === "PATCH")) return `${route}/${id}`;
  if (action === "revisions" && /^[1-9]\d{0,9}$/.test(revision ?? "") && Number(revision) <= 2147483647) {
    if (parts.length === 4 && method === "GET") return `${route}/${id}/revisions/${Number(revision)}`;
    if (parts.length === 5 && method === "POST" && operation === "restore") {
      return `${route}/${id}/revisions/${Number(revision)}/restore`;
    }
  }
  if (parts.length !== 3) return null;
  if (((action === "preview" || action === "revisions") && method === "GET") || (method === "POST" && contentActions.some((allowed) => allowed === action))) {
    return `${route}/${id}/${action}`;
  }
  return null;
}
