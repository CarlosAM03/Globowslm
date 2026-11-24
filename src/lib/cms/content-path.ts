export const enabledContent = ["site", "service", "event_type"] as const;
export type ContentKind = typeof enabledContent[number];
export const contentActions = ["publish", "withdraw", "archive", "restore"] as const;
export type ContentAction = typeof contentActions[number];
export type ContentEndpoint =
  | `admin/content/${ContentKind}`
  | `admin/content/${ContentKind}/${string}`
  | `admin/content/${ContentKind}/${string}/${"preview" | ContentAction}`;

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function resolveContentPath(parts: readonly string[], method: string): ContentEndpoint | null {
  const [kind, id, action] = parts;
  if (!enabledContent.some((allowed) => allowed === kind)) return null;
  const route = `admin/content/${kind as ContentKind}` as const;
  if (parts.length === 1 && (method === "GET" || method === "POST")) return route;
  if (!uuid.test(id ?? "")) return null;
  if (parts.length === 2 && (method === "GET" || method === "PATCH")) return `${route}/${id}`;
  if (parts.length !== 3) return null;
  if ((action === "preview" && method === "GET") || (method === "POST" && contentActions.some((allowed) => allowed === action))) {
    return `${route}/${id}/${action}`;
  }
  return null;
}
