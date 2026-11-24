import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { OwnerSession } from "@/types/cms/auth";
import type { AuthAction } from "./auth-path";
import type { PublicationState } from "@/types/cms/publications";
import type { ContentEndpoint, ContentKind } from "./content-path";
import type { MediaEndpoint } from "./media-path";

export const ownerCookie = "globows_owner";
export const loginCookie = "globows_login_challenge";
export const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function getCmsConfig() {
  const app = new URL(process.env.APP_ORIGIN ?? "");
  const api = new URL(process.env.CMS_API_INTERNAL_URL ?? "");
  const isOrigin = (url: URL) => !url.username && !url.password && url.href === `${url.origin}/`;
  const local = app.protocol === "http:" && ["127.0.0.1", "localhost"].includes(app.hostname);
  if (!isOrigin(app) || !isOrigin(api) || (!local && app.protocol !== "https:") ||
      (api.protocol !== "https:" && !(local && api.protocol === "http:"))) {
    throw new Error("Configuración CMS inválida");
  }
  return { appOrigin: app.origin, apiOrigin: api.origin, secure: app.protocol === "https:" };
}

type CmsOptions = { method: "GET" | "POST" | "PATCH" | "DELETE"; page?: number; mediaType?: "image" | "video"; kind?: ContentKind; state?: PublicationState; requestId: string; token?: string; csrf?: string; body?: string };
type CmsEndpoint = `auth/${AuthAction}` | "admin/dashboard" | "admin/publications" | ContentEndpoint | MediaEndpoint;

export function requestCms(
  config: ReturnType<typeof getCmsConfig>,
  endpoint: CmsEndpoint,
  options: CmsOptions,
) {
  const headers = new Headers({ Accept: "application/json", Origin: config.appOrigin, "X-Request-Id": options.requestId });
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  if (options.csrf) headers.set("X-Csrf-Token", options.csrf);
  if (options.body) headers.set("Content-Type", "application/json");
  const url = new URL(`/api/v1/${endpoint}`, config.apiOrigin);
  if (options.page !== undefined) url.searchParams.set("page", String(options.page));
  if (options.mediaType) url.searchParams.set("type", options.mediaType);
  if (options.kind) url.searchParams.set("kind", options.kind);
  if (options.state) url.searchParams.set("state", options.state);
  return fetch(url, {
    headers,
    method: options.method,
    body: options.body,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
}

export function requestAuth(config: ReturnType<typeof getCmsConfig>, action: AuthAction, options: CmsOptions) {
  return requestCms(config, `auth/${action}`, options);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function parseSession(value: unknown): OwnerSession | null {
  if (!isRecord(value) || !isRecord(value.owner)) return null;
  const { id, email, role } = value.owner;
  const { csrfToken } = value;
  if (typeof id !== "string" || typeof email !== "string" || role !== "OWNER" ||
      typeof csrfToken !== "string" || !tokenPattern.test(csrfToken)) return null;
  return { owner: { id, email, role }, csrfToken };
}

export async function readOwnerSession(): Promise<
  { state: "anonymous" | "unavailable" } | { state: "authenticated"; data: OwnerSession }
> {
  await connection();
  const token = (await cookies()).get(ownerCookie)?.value;
  if (!token || !tokenPattern.test(token)) return { state: "anonymous" };
  try {
    const response = await requestAuth(getCmsConfig(), "session", { method: "GET", requestId: randomUUID(), token });
    if (response.status === 401) return { state: "anonymous" };
    if (response.ok) {
      const data = parseSession(await response.json());
      if (data) return { state: "authenticated", data };
    }
  } catch {
    return { state: "unavailable" };
  }
  return { state: "unavailable" };
}
