"use client";

import { useEffect, useState } from "react";
import { listMedia } from "@/lib/cms/media-client";
import type { Asset, AssetType } from "@/types/cms/media";

export function MediaSelect({
  id, label, type, value, onChange,
}: { id: string; label: string; type: AssetType; value?: string; onChange: (id?: string) => void }) {
  const [items, setItems] = useState<Asset[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      try {
        const first = await listMedia(1, type, abort.signal);
        const all = [...first.items];
        for (let page = 2; page <= Math.ceil(first.total / first.pageSize); page++) {
          all.push(...(await listMedia(page, type, abort.signal)).items);
        }
        if (!abort.signal.aborted) {
          setItems(all.filter((row) => row.status === "READY"));
          setStatus("ready");
        }
      } catch {
        if (!abort.signal.aborted) setStatus("error");
      }
    }
    void load();
    return () => abort.abort();
  }, [type]);

  const currentVisible = items.some(({ id }) => id === value);
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value ?? ""} onChange={(event) => onChange(event.target.value || undefined)}
        aria-describedby={`${id}-hint`} disabled={status !== "ready"}>
        <option value="">Sin selección</option>
        {value && !currentVisible ? <option value={value}>Referencia actual</option> : null}
        {items.map((asset) => <option key={asset.id} value={asset.id}>{asset.title || asset.originalName}</option>)}
      </select>
      <small id={`${id}-hint`}>{status === "loading" ? "Cargando biblioteca…" : status === "error" ? "No se pudo cargar la biblioteca." : "Selecciona un archivo disponible en la biblioteca."}</small>
    </div>
  );
}
