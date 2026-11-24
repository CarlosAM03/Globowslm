"use client";

import { useState } from "react";
import Image from "next/image";
import { getMedia, previewMedia } from "@/lib/cms/media-client";
import { useCsrfToken } from "./AdminSession";
import { StatusPanel } from "./StatusPanel";

export function EditorialMediaPreview({ id, type, label }: { id: string; type?: "image" | "video"; label: string }) {
  const csrf = useCsrfToken();
  const [asset, setAsset] = useState<{ url: string; type: "image" | "video" }>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    setPending(true);
    setError(false);
    try {
      const [ticket, category] = await Promise.all([
        previewMedia(id, csrf), type ?? getMedia(id).then(({ mime }) => mime.startsWith("image/") ? "image" as const : "video" as const),
      ]);
      setAsset({ url: ticket.url, type: category });
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return <div className="admin-preview">
    {error ? <StatusPanel kind="error">El archivo no está disponible para previsualización.</StatusPanel> : null}
    {asset?.type === "image" ? <Image src={asset.url} width={420} height={280} alt={label} unoptimized /> : null}
    {asset?.type === "video" ? <video src={asset.url} controls preload="metadata" aria-label={label} /> : null}
    <button type="button" disabled={pending} onClick={() => void load()}>
      {asset ? "Actualizar" : "Ver"} {label}
    </button>
  </div>;
}
