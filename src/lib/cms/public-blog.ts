import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import type { PostPage, PublicPost } from "@/types/cms/public-blog";
import { getCmsConfig } from "./auth-server";
import { validSlug } from "./blog-slug";
export { validSlug } from "./blog-slug";

type Result<T> = { state: "ready"; data: T } | { state: "missing" | "unavailable" };

async function request<T>(path: string, query?: URLSearchParams): Promise<Result<T>> {
  try {
    const { apiOrigin } = getCmsConfig();
    const url = new URL(`/api/v1/public/posts${path}`, apiOrigin);
    if (query) url.search = query.toString();
    const response = await fetch(url, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000), headers: { Accept: "application/json" },
    });
    if (response.status === 404) return { state: "missing" };
    return response.ok ? { state: "ready", data: await response.json() as T } : { state: "unavailable" };
  } catch {
    return { state: "unavailable" };
  }
}

export async function readPosts(page: number, category?: string): Promise<Result<PostPage>> {
  await connection();
  if (!process.env.CMS_API_INTERNAL_URL) return { state: "ready", data: { items: [], categories: [], page, total: 0, pageSize: 10 } };
  const query = new URLSearchParams({ page: String(page) });
  if (category && validSlug(category)) query.set("category", category);
  return request<PostPage>("", query);
}

export const readPost = cache(async (slug: string): Promise<Result<PublicPost>> => {
  await connection();
  if (!validSlug(slug) || !process.env.CMS_API_INTERNAL_URL) return { state: "missing" };
  return request<PublicPost>(`/${slug}`);
});
