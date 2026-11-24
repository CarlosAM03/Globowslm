import type { Asset, AssetPage, AssetType } from "@/types/cms/media";
import { CmsRequestError } from "./content-client";

const route = "/api/cms/admin/media";
export const supportedMedia = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];

async function read<T>(response: Response) {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new CmsRequestError(response.status, data?.message ?? "No se pudo completar la operación multimedia.");
  }
  return await response.json() as T;
}

async function api<T>(path: string, init?: RequestInit) {
  return read<T>(await fetch(`${route}${path}`, { cache: "no-store", ...init }));
}

function request(method: "POST" | "PATCH" | "DELETE", body: object, csrf: string) {
  return {
    method, headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf }, body: JSON.stringify(body),
  };
}

export function listMedia(page = 1, type?: AssetType, signal?: AbortSignal) {
  return api<AssetPage>(`?page=${page}${type ? `&type=${type}` : ""}`, { signal });
}

export async function uploadMedia(file: File, csrf: string) {
  if (!supportedMedia.includes(file.type)) throw new CmsRequestError(415, "Selecciona JPG, PNG, WebP, MP4 o WebM.");
  const signed = await api<{ url: string; token: string }>("/upload-ticket", request("POST", {
    filename: file.name, size: file.size, mime: file.type,
  }, csrf));
  const response = await fetch(signed.url, {
    method: "POST", headers: { Authorization: `Bearer ${signed.token}`, "Content-Type": file.type },
    body: file, credentials: "omit", redirect: "error", cache: "no-store",
  });
  return read<Asset>(response);
}

export function previewMedia(id: string, csrf: string) {
  return api<{ url: string }>(`/${id}/preview-ticket`, request("POST", {}, csrf));
}

export function editMedia(asset: Pick<Asset, "id" | "version" | "title" | "alt">, csrf: string, retire = false) {
  const { id, version, title, alt } = asset;
  return api<Asset>(`/${id}`, request("PATCH", { version, title, alt, retire }, csrf));
}

export function removeMedia(asset: Pick<Asset, "id" | "version">, csrf: string) {
  return api<{ deleted: true }>(`/${asset.id}`, request("DELETE", { version: asset.version }, csrf));
}
