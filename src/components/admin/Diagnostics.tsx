"use client";

import { useEffect, useState } from "react";

type DiagnosticsData = {
  database: "ok" | "unavailable";
  storage: "ok" | "unavailable";
  audit: { actorId: string; action: string; entityType: string; requestId: string; at: string; outcome: string }[] | null;
};

export function Diagnostics() {
  const [data, setData] = useState<DiagnosticsData>();
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/cms/admin/diagnostics", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Diagnóstico indisponible");
        return response.json() as Promise<DiagnosticsData>;
      })
      .then(setData, () => { if (!controller.signal.aborted) setUnavailable(true); });
    return () => controller.abort();
  }, []);

  if (unavailable) return <p role="alert">No se pudo consultar el diagnóstico.</p>;
  if (!data) return <p role="status">Cargando diagnóstico…</p>;
  return (
    <>
      <dl>
        <dt>Base de datos</dt><dd>{data.database === "ok" ? "Disponible" : "Indisponible"}</dd>
        <dt>Almacenamiento</dt><dd>{data.storage === "ok" ? "Disponible" : "Indisponible"}</dd>
      </dl>
      <h2>Auditoría reciente</h2>
      {data.audit === null ? <p role="alert">Auditoría indisponible.</p> : (
        data.audit.length === 0 ? <p>Sin eventos.</p> : (
          <ul>{data.audit.map((row, index) => (
            <li key={`${row.requestId}:${index}`}>
              <time dateTime={row.at}>{row.at}</time>{" · "}
              {row.action} · {row.entityType} · {row.outcome} · Actor {row.actorId} · Solicitud {row.requestId}
            </li>
          ))}</ul>
        )
      )}
    </>
  );
}
