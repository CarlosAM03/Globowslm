export type MediaEndpoint =
  | "admin/media"
  | "admin/media/upload-ticket"
  | `admin/media/${string}`
  | `admin/media/${string}/preview-ticket`;

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
export function resolveMediaPath(parts: readonly string[], method: string): MediaEndpoint | null {
  const [id, action] = parts;
  if (parts.length === 0 && method === "GET") return "admin/media";
  if (parts.length === 1 && id === "upload-ticket" && method === "POST") return "admin/media/upload-ticket";
  if (!uuid.test(id ?? "")) return null;
  if (parts.length === 1 && ["GET", "PATCH", "DELETE"].includes(method)) return `admin/media/${id}`;
  if (parts.length === 2 && action === "preview-ticket" && method === "POST") return `admin/media/${id}/preview-ticket`;
  return null;
}
