"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DashboardData, Totals } from "@/types/cms/dashboard";
import { StatusPanel } from "./StatusPanel";

const typeNames: Record<string, string> = {
  SITE: "Institucional", SERVICE: "Servicios", EVENT_TYPE: "Tipos de evento",
  GALLERY_CATEGORY: "Categorías de galería", GALLERY: "Galerías", TRAINING: "Formación",
  CERTIFICATION: "Certificaciones", BLOG_CATEGORY: "Categorías de blog", POST: "Artículos",
  MEDIA: "Multimedia",
};
const actionNames: Record<string, string> = {
  CREATE: "Creación", EDIT: "Edición", PUBLISH: "Publicación",
  WITHDRAW: "Retiro", ARCHIVE: "Archivo", RESTORE: "Restauración",
};
const counts: Array<{ key: keyof Totals; label: string }> = [
  { key: "draft", label: "Borradores" },
  { key: "published", label: "Publicados" },
  { key: "withdrawn", label: "Retirados" },
];
const dateFormat = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Tijuana", dateStyle: "short", timeStyle: "short",
});

type State =
  | { kind: "loading" | "error" | "expired" }
  | { kind: "ready"; value: DashboardData };

export function Dashboard() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/cms/admin/dashboard", { cache: "no-store", signal: abort.signal });
        if (response.status === 401) {
          if (!abort.signal.aborted) setState({ kind: "expired" });
          return;
        }
        if (!response.ok) throw new Error("Dashboard no disponible");
        const value: DashboardData = await response.json();
        if (!abort.signal.aborted) setState({ kind: "ready", value });
      } catch {
        if (!abort.signal.aborted) setState({ kind: "error" });
      }
    }
    void load();
    return () => abort.abort();
  }, [attempt]);

  if (state.kind === "loading") return <StatusPanel kind="loading">Cargando el resumen…</StatusPanel>;
  if (state.kind === "expired") return <StatusPanel kind="error">La sesión terminó. <Link href="/admin/login">Iniciar sesión</Link></StatusPanel>;
  if (state.kind !== "ready") {
    return (
      <StatusPanel kind="error">
        <p>No se pudo cargar el resumen.</p>
        <button type="button" onClick={() => { setState({ kind: "loading" }); setAttempt((value) => value + 1); }}>Reintentar</button>
      </StatusPanel>
    );
  }

  const { totals, byKind, recent } = state.value;
  return (
    <>
      <dl className="admin-metrics">
        {counts.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{totals[key]}</dd></div>)}
      </dl>
      <section aria-labelledby="content-by-kind">
        <h2 id="content-by-kind">Contenido por tipo</h2>
        {byKind.length === 0 ? <StatusPanel kind="empty">Aún no hay contenido editorial.</StatusPanel> : (
          <div className="admin-table-scroll">
            <table>
              <thead><tr><th scope="col">Tipo</th>{counts.map(({ key, label }) => <th scope="col" key={key}>{label}</th>)}</tr></thead>
              <tbody>
                {byKind.map((row) => (
                  <tr key={row.kind}>
                    <th scope="row">{typeNames[row.kind] ?? row.kind}</th>
                    {counts.map(({ key }) => <td key={key}>{row[key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section aria-labelledby="recent-activity">
        <h2 id="recent-activity">Tu actividad reciente</h2>
        {recent.length === 0 ? <StatusPanel kind="empty">Aún no hay operaciones propias.</StatusPanel> : (
          <ul className="admin-activity">
            {recent.map((event) => (
              <li key={event.id}>
                <span>{actionNames[event.action] ?? event.action} · {typeNames[event.entityType] ?? event.entityType}</span>
                <time dateTime={event.at}>{dateFormat.format(new Date(event.at))}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
