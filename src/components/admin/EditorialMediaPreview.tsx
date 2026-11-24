"use client";

import { useState } from "react";
import Image from "next/image";
import { previewMedia } from "@/lib/cms/media-client";
import { useCsrfToken } from "./AdminSession";
import { StatusPanel } from "./StatusPanel";

export function EditorialMediaPreview({ id, type, label }: { id: string; type: "image" | "video"; label: string }) {
  const csrf = useCsrfToken();
  const [url, setUrl] = useState<string>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    setPending(true);
    setError(false);
    try {
      setUrl((await previewMedia(id, csrf)).url);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return <div className="admin-preview">
    {error ? <StatusPanel kind="error">El archivo no está disponible para previsualización.</StatusPanel> : null}
    {url && type === "image" ? <Image src={url} width={420} height={280} alt={label} unoptimized /> : null}
    {url && type === "video" ? <video src={url} controls preload="metadata" aria-label={label} /> : null}
    <button type="button" disabled={pending} onClick={() => void load()}>
      {url ? "Actualizar" : "Ver"} {label}
    </button>
  </div>;
}
