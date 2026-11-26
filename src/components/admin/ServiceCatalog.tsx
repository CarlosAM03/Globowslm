"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  changeContent, CmsRequestError, listContent, previewContent, writeDraft,
} from "@/lib/cms/content-client";
import type { ContentAction } from "@/lib/cms/content-path";
import type { CmsDraft, CmsList } from "@/types/cms/content";
import { useCsrfToken } from "./AdminSession";
import { Field } from "./Field";
import { MediaSelect } from "./MediaSelect";
import { StatusPanel } from "./StatusPanel";

type Kind = "service" | "event_type";
type CatalogPayload = { title: string; description?: string; ctaInterest?: string; eventTypes?: string[]; imageRef?: string };
const empty: CatalogPayload = { title: "", description: "", ctaInterest: "general", eventTypes: [] };
const states = { DRAFT: "Borrador", PUBLISHED: "Publicado", WITHDRAWN: "Retirado" };
const interests = [
  ["general", "Consulta general"], ["decoracion", "Decoración"], ["cursos", "Cursos"], ["talleres", "Talleres"],
  ["certificaciones", "Certificaciones"], ["asesorias", "Asesorías"],
] as const;
const actions: Array<{ value: ContentAction; name: string }> = [
  { value: "publish", name: "Publicar" }, { value: "withdraw", name: "Retirar" },
  { value: "archive", name: "Archivar" }, { value: "restore", name: "Restaurar borrador" },
];

function slugFor(title: string) {
  return title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/, "");
}

async function eventOptions(signal: AbortSignal) {
  const first = await listContent<CatalogPayload>("event_type", signal);
  const items = [...first.items];
  for (let page = 2; items.length < first.total && page <= Math.ceil(first.total / first.pageSize); page++) {
    items.push(...(await listContent<CatalogPayload>("event_type", signal, page)).items);
  }
  return items.filter((item) => !item.archived);
}

function visibleAction(action: ContentAction, row: CmsDraft<CatalogPayload>) {
  if (action === "restore") return row.state === "WITHDRAWN";
  if (row.archived) return false;
  return action !== "withdraw" || row.state === "PUBLISHED";
}

function CatalogEditor({ kind }: { kind: Kind }) {
  const csrf = useCsrfToken();
  const isService = kind === "service";
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [collection, setCollection] = useState<CmsList<CatalogPayload>>();
  const [events, setEvents] = useState<CmsDraft<CatalogPayload>[]>([]);
  const [current, setCurrent] = useState<CmsDraft<CatalogPayload>>();
  const [form, setForm] = useState<CatalogPayload>();
  const [position, setPosition] = useState(0);
  const [preview, setPreview] = useState<CatalogPayload>();
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [issue, setIssue] = useState<CmsRequestError>();
  const dirty = !!current && (JSON.stringify(form) !== JSON.stringify(current.payload) || current.position !== position);

  useEffect(() => {
    const abort = new AbortController();
    Promise.all([
      listContent<CatalogPayload>(kind, abort.signal, page),
      isService ? eventOptions(abort.signal) : Promise.resolve([]),
    ]).then(([list, options]) => {
      if (abort.signal.aborted) return;
      setCollection(list);
      setEvents(options);
    }).catch((error: unknown) => {
      if (abort.signal.aborted) return;
      setIssue(error instanceof CmsRequestError ? error : new CmsRequestError(503, "No se pudo cargar el catálogo."));
    });
    return () => abort.abort();
  }, [kind, page, revision, isService]);

  function open(row?: CmsDraft<CatalogPayload>) {
    setCurrent(row);
    setForm(row?.payload ?? empty);
    setPosition(row?.position ?? 0);
    setIssue(undefined);
    setNotice("");
    setPreview(undefined);
  }

  async function operation(run: () => Promise<void>) {
    setIssue(undefined);
    setNotice("");
    setWorking(true);
    try {
      await run();
    } catch (error) {
      setIssue(error instanceof CmsRequestError ? error : new CmsRequestError(503, "No se pudo completar la operación."));
    } finally {
      setWorking(false);
    }
  }

  function store(row: CmsDraft<CatalogPayload>, message: string) {
    setCurrent(row);
    setForm(row.payload);
    setPosition(row.position);
    setPreview(undefined);
    setNotice(message);
    setRevision((value) => value + 1);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    const title = form.title.trim();
    const description = form.description?.trim() || undefined;
    const payload = isService
      ? { title, description, ctaInterest: form.ctaInterest ?? "general", eventTypes: form.eventTypes ?? [], imageRef: form.imageRef }
      : { title, description, imageRef: form.imageRef };
    void operation(async () => {
      const slug = current?.slug ?? slugFor(title);
      if (!slug) throw new CmsRequestError(422, "Escribe un nombre que incluya letras o números.");
      store(await writeDraft(kind, { slug, position, payload }, csrf, current), "Borrador guardado.");
    });
  }

  function transition(action: ContentAction) {
    if (!current) return;
    if ((action === "archive" || action === "withdraw") && !window.confirm("¿Confirmas retirar este contenido?")) return;
    void operation(async () => {
      const updated = await changeContent<CatalogPayload>(kind, current, action, csrf);
      const messages = {
        publish: "Contenido publicado.", withdraw: "Contenido retirado.",
        archive: "Contenido archivado.", restore: "Borrador restaurado.",
      };
      store(updated, messages[action]);
    });
  }

  return (
    <div className="admin-catalog">
      {issue ? <StatusPanel kind="error">
        <p>{issue.fieldErrors?.imageRef ?? issue.message}</p>
        {issue.status === 409 || issue.status === 503 ? <button type="button" onClick={() => {
          setIssue(undefined);
          setCollection(undefined);
          setForm(undefined);
          setRevision((value) => value + 1);
        }}>Recargar</button> : null}
      </StatusPanel> : null}
      {notice ? <p role="status">{notice}</p> : null}
      {!collection && !issue ? <StatusPanel kind="loading">Cargando catálogo…</StatusPanel> : null}
      {collection && collection.items.length === 0 ? <StatusPanel kind="empty">Aún no hay entradas en este catálogo.</StatusPanel> : null}
      {collection && collection.items.length > 0 ? (
        <div className="admin-table-scroll">
          <table>
            <thead><tr><th scope="col">Nombre</th><th scope="col">Orden</th><th scope="col">Estado</th><th scope="col">Acción</th></tr></thead>
            <tbody>{collection.items.map((row) => <tr key={row.id}>
              <th scope="row">{row.payload.title}</th><td>{row.position}</td>
              <td>{row.archived ? "Archivado" : states[row.state]}</td>
              <td><button type="button" onClick={() => open(row)} aria-label={`Abrir ${row.payload.title}`}>Abrir</button></td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : null}
      <div className="admin-editor-actions">
        <button type="button" onClick={() => open()}>Crear {isService ? "servicio" : "tipo de evento"}</button>
        {collection && page > 1 ? <button type="button" onClick={() => setPage((value) => value - 1)}>Anterior</button> : null}
        {collection && page * collection.pageSize < collection.total ? <button type="button" onClick={() => setPage((value) => value + 1)}>Siguiente</button> : null}
      </div>
      {form ? (
        <form className="admin-editor" method="post" onSubmit={save}>
          <fieldset disabled={working || current?.archived}>
            <legend>{current ? "Editar" : "Crear"} {isService ? "servicio" : "tipo de evento"}</legend>
            <Field id="catalog-title" label="Nombre" value={form.title} required maxLength={160}
              onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <div className="admin-field">
              <label htmlFor="catalog-description">Descripción</label>
              <textarea id="catalog-description" rows={3} required={isService} maxLength={4000} value={form.description ?? ""}
                onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <MediaSelect id="catalog-image" label="Imagen representativa" type="image" value={form.imageRef}
              onChange={(imageRef) => setForm({ ...form, imageRef })} />
            <Field id="catalog-position" label="Orden" type="number" min={0} max={2147483647} required value={position}
              onChange={(event) => setPosition(event.currentTarget.valueAsNumber || 0)} />
            {isService ? <>
              <div className="admin-field">
                <label htmlFor="catalog-cta">Motivo de contacto</label>
                <select id="catalog-cta" value={form.ctaInterest ?? "general"}
                  onChange={(event) => setForm({ ...form, ctaInterest: event.target.value })}>
                  {interests.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <fieldset>
                <legend>Tipos de evento relacionados</legend>
                {events.length === 0 ? <p>Agrega tipos de evento desde su catálogo.</p> : events.map((row) => (
                  <label key={row.id} className="admin-check">
                    <input type="checkbox" checked={form.eventTypes?.includes(row.id) ?? false} onChange={(event) => {
                      const ids = form.eventTypes ?? [];
                      setForm({ ...form, eventTypes: event.target.checked ? [...ids, row.id] : ids.filter((id) => id !== row.id) });
                    }} />
                    {row.payload.title} {row.state !== "PUBLISHED" ? `(${states[row.state].toLowerCase()})` : ""}
                  </label>
                ))}
              </fieldset>
            </> : null}
          </fieldset>
          {dirty ? <p role="status">Hay cambios sin guardar.</p> : null}
          <div className="admin-editor-actions">
            <button type="submit" disabled={working || current?.archived}>Guardar borrador</button>
            {current ? <button type="button" disabled={dirty || working} onClick={() => {
              void operation(async () => setPreview((await previewContent<CatalogPayload>(kind, current.id)).payload));
            }}>Previsualizar</button> : null}
            {current ? actions.filter(({ value }) => visibleAction(value, current)).map(({ value, name }) => (
              <button key={value} type="button" disabled={working || dirty} onClick={() => transition(value)}>{name}</button>
            )) : null}
          </div>
        </form>
      ) : null}
      {preview ? <section className="admin-preview" aria-label="Vista previa del borrador">
        <h2>{preview.title}</h2><p>{preview.description}</p>
        {isService ? <p>{interests.find(([value]) => value === preview.ctaInterest)?.[1]}</p> : null}
        <button type="button" onClick={() => setPreview(undefined)}>Cerrar vista previa</button>
      </section> : null}
    </div>
  );
}

export function ServiceCatalog() {
  const [kind, setKind] = useState<Kind>("service");
  return (
    <>
      <div className="admin-editor-actions" aria-label="Catálogos">
        <button type="button" aria-pressed={kind === "service"} onClick={() => setKind("service")}>Servicios</button>
        <button type="button" aria-pressed={kind === "event_type"} onClick={() => setKind("event_type")}>Tipos de evento</button>
      </div>
      <CatalogEditor key={kind} kind={kind} />
    </>
  );
}
