"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { changeContent, CmsRequestError, previewContent } from "@/lib/cms/content-client";
import { enabledContent, type ContentAction, type ContentKind } from "@/lib/cms/content-path";
import { listPublications, listRevisions, readRevision, restoreRevision } from "@/lib/cms/publication-client";
import { publicationStates, type PageOf, type Publication, type PublicationState, type Revision, type RevisionDetail } from "@/types/cms/publications";
import { useCsrfToken } from "./AdminSession";
import { StatusPanel } from "./StatusPanel";

const typeInfo: Record<ContentKind, [string, string]> = {
  site: ["Institucional", "/admin/institucional"],
  service: ["Servicio", "/admin/servicios"],
  event_type: ["Tipo de evento", "/admin/servicios"],
  gallery: ["Galería", "/admin/galerias"],
  gallery_category: ["Categoría de galería", "/admin/galerias"],
  training: ["Formación", "/admin/formacion"],
  certification: ["Certificación", "/admin/certificaciones"],
  post: ["Artículo", "/admin/blog"],
  blog_category: ["Categoría de blog", "/admin/blog"],
};
const stateNames = { DRAFT: "Borrador", PUBLISHED: "Publicado", WITHDRAWN: "Retirado" };
const names = {
  publish: ["Publicar", "Contenido publicado."],
  withdraw: ["Retirar", "Contenido retirado."],
  archive: ["Archivar", "Contenido archivado."],
  restore: ["Restaurar borrador", "Borrador restaurado."],
} as const;
const dateTime = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Tijuana" });
const kindOf = (row: Publication) => row.kind.toLowerCase() as ContentKind;
const stateOf = (row: Publication) => row.archived ? "Archivado" : stateNames[row.state];

function Preview({ title, payload }: { title: string; payload: object }) {
  const data = payload as Record<string, unknown>;
  return <div>
    <h3>{title}</h3>
    {["description", "excerpt", "trajectory", "issuer"].map((key) => typeof data[key] === "string" ?
      <p key={key}>{data[key]}</p> : null)}
    {Array.isArray(data.blocks) ? <p>{data.blocks.length} bloques</p> : null}
    {Array.isArray(data.orderedPhotoRefs) ? <p>{data.orderedPhotoRefs.length} fotografías</p> : null}
    <details><summary>Ver campos de la revisión</summary><pre className="admin-revision-data">{JSON.stringify(payload, null, 2)}</pre></details>
  </div>;
}

function Pagination<T>({ data, change }: { data?: PageOf<T>; change: (page: number) => void }) {
  if (!data) return null;
  return <div className="admin-editor-actions" aria-label="Paginación">
    {data.page > 1 ? <button type="button" onClick={() => change(data.page - 1)}>Anterior</button> : null}
    {data.page * data.pageSize < data.total ? <button type="button" onClick={() => change(data.page + 1)}>Siguiente</button> : null}
  </div>;
}

export function Publications() {
  const csrf = useCsrfToken();
  const [list, setList] = useState<PageOf<Publication>>();
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState<ContentKind>();
  const [state, setState] = useState<PublicationState>();
  const [reload, setReload] = useState(0);
  const [row, setRow] = useState<Publication>();
  const [history, setHistory] = useState<PageOf<Revision>>();
  const [draft, setDraft] = useState<object>();
  const [revision, setRevision] = useState<RevisionDetail>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    listPublications(page, kind, state, abort.signal).then((data) => {
      if (!abort.signal.aborted) setList(data);
    }).catch((cause: unknown) => {
      if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudieron cargar las publicaciones.");
    });
    return () => abort.abort();
  }, [page, kind, state, reload]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof CmsRequestError ? cause.message : "No se pudo completar la operación.");
    } finally {
      setBusy(false);
    }
  }

  function loadHistory(selected: Publication, page = 1) {
    return listRevisions(kindOf(selected), selected.id, page);
  }

  function open(selected: Publication) {
    setRow(selected);
    setHistory(undefined);
    setDraft(undefined);
    setRevision(undefined);
    void run(async () => setHistory(await loadHistory(selected)));
  }

  function refresh() {
    setRow(undefined);
    setDraft(undefined);
    setHistory(undefined);
    setRevision(undefined);
    setList(undefined);
    setError("");
    setReload((value) => value + 1);
  }

  function changed(message: string) {
    refresh();
    setNotice(message);
  }

  function change(action: ContentAction) {
    if (!row || ((action === "withdraw" || action === "archive") && !window.confirm("¿Confirmas retirar esta publicación?"))) return;
    void run(async () => {
      await changeContent(kindOf(row), row, action, csrf);
      changed(names[action][1]);
    });
  }

  function copyRevision() {
    if (!row || !revision || !window.confirm("¿Copiar esta revisión al borrador actual?")) return;
    void run(async () => {
      await restoreRevision(kindOf(row), row, revision.revisionNo, csrf);
      changed("Revisión copiada al borrador.");
    });
  }

  return <div className="admin-catalog">
    <div className="admin-editor-actions">
      <div className="admin-field">
        <label htmlFor="publications-kind">Tipo de contenido</label>
        <select id="publications-kind" value={kind ?? ""} disabled={busy} onChange={(event) => {
          setKind((event.target.value || undefined) as ContentKind | undefined);
          setPage(1);
          refresh();
        }}>
          <option value="">Todos</option>
          {enabledContent.map((type) => <option key={type} value={type}>{typeInfo[type][0]}</option>)}
        </select>
      </div>
      <div className="admin-field">
        <label htmlFor="publications-state">Estado editorial</label>
        <select id="publications-state" value={state ?? ""} disabled={busy} onChange={(event) => {
          setState((event.target.value || undefined) as PublicationState | undefined);
          setPage(1);
          refresh();
        }}>
          <option value="">Todos</option>
          {publicationStates.map((value) => <option key={value} value={value}>{stateNames[value]}</option>)}
        </select>
      </div>
    </div>
    {notice ? <p role="status">{notice}</p> : null}
    {error ? <StatusPanel kind="error"><p>{error}</p><button type="button" onClick={refresh}>Actualizar listado</button></StatusPanel> : null}
    {!list && !error ? <StatusPanel kind="loading">Cargando publicaciones…</StatusPanel> : null}
    {list && !list.items.length ? <StatusPanel kind="empty">No hay contenido para los filtros seleccionados.</StatusPanel> : null}
    {list && list.items.length > 0 ? <div className="admin-table-scroll"><table>
      <thead><tr><th scope="col">Contenido</th><th scope="col">Tipo</th><th scope="col">Estado</th><th scope="col">Actualización</th><th scope="col">Acción</th></tr></thead>
      <tbody>{list.items.map((item) => <tr key={item.id}>
        <th scope="row">{item.title}</th><td>{typeInfo[kindOf(item)][0]}</td><td>{stateOf(item)}</td>
        <td><time dateTime={item.updatedAt}>{dateTime.format(new Date(item.updatedAt))}</time></td>
        <td><button type="button" disabled={busy} aria-label={`Revisar ${item.title}`} onClick={() => open(item)}>Revisar</button></td>
      </tr>)}</tbody>
    </table></div> : null}
    <Pagination data={list} change={(next) => { setPage(next); refresh(); }} />
    {row ? <section className="admin-preview" aria-label="Detalle editorial">
      <h2>{row.title}</h2>
      <p>{stateOf(row)} · versión de borrador {row.version}</p>
      <div className="admin-editor-actions">
        <Link href={typeInfo[kindOf(row)][1]}>Abrir módulo</Link>
        <button type="button" disabled={busy} onClick={() => void run(async () => {
          setDraft((await previewContent<object>(kindOf(row), row.id)).payload);
          setRevision(undefined);
        })}>Previsualizar borrador</button>
        {!row.archived ? <button type="button" disabled={busy} onClick={() => change("publish")}>{names.publish[0]}</button> : null}
        {!row.archived && row.kind !== "SITE" ? <>
          {row.state === "PUBLISHED" ? <button type="button" disabled={busy} onClick={() => change("withdraw")}>{names.withdraw[0]}</button> : null}
          <button type="button" disabled={busy} onClick={() => change("archive")}>{names.archive[0]}</button>
        </> : null}
        {row.state === "WITHDRAWN" ? <button type="button" disabled={busy} onClick={() => change("restore")}>{names.restore[0]}</button> : null}
      </div>
      <h3>Historial de revisiones</h3>
      {history && !history.items.length ? <p>Aún no hay revisiones publicadas.</p> : null}
      {history?.items.length ? <ol>{history.items.map((item) => <li key={item.revisionNo}>
        <button type="button" disabled={busy} onClick={() => void run(async () => {
          setRevision(await readRevision(kindOf(row), row.id, item.revisionNo));
          setDraft(undefined);
        })}>Revisión {item.revisionNo}</button>{" · "}
        <time dateTime={item.publishedAt}>{dateTime.format(new Date(item.publishedAt))}</time>
        {item.active ? " · Publicación vigente" : ""}
      </li>)}</ol> : null}
      <Pagination data={history} change={(next) => void run(async () => setHistory(await loadHistory(row, next)))} />
      {draft ? <Preview title="Vista del borrador" payload={draft} /> : null}
      {revision ? <>
        <Preview title={`Vista de la revisión ${revision.revisionNo}`} payload={revision.payload} />
        {!row.archived ? <button type="button" disabled={busy} onClick={copyRevision}>Copiar al borrador</button> : null}
      </> : null}
    </section> : null}
  </div>;
}
