"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { changeContent, CmsRequestError, listContent, previewContent, writeDraft } from "@/lib/cms/content-client";
import type { ContentAction, ContentKind } from "@/lib/cms/content-path";
import type { CmsDraft, CmsList } from "@/types/cms/content";
import { useCsrfToken } from "./AdminSession";
import { Field } from "./Field";
import { StatusPanel } from "./StatusPanel";

const states = { DRAFT: "Borrador", PUBLISHED: "Publicado", WITHDRAWN: "Retirado" };
const actions = [
  ["publish", "Publicar", "Contenido publicado."],
  ["withdraw", "Retirar", "Contenido retirado."],
  ["archive", "Archivar", "Contenido archivado."],
  ["restore", "Restaurar borrador", "Borrador restaurado."],
] as const;

function slugFor(title: string) {
  return title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/, "");
}

type Named = { title: string };
type Props<T extends Named> = {
  kind: ContentKind;
  noun: string;
  empty: T;
  fields: (draft: T, change: (next: T) => void) => ReactNode;
  preview: (draft: T) => ReactNode;
  normalize?: (draft: T) => T;
  customSlug?: boolean;
};

function available(action: ContentAction, row: CmsDraft<Named>) {
  if (action === "restore") return row.state === "WITHDRAWN";
  return !row.archived && (action !== "withdraw" || row.state === "PUBLISHED");
}

export function EditorialCatalog<T extends Named>({ kind, noun, empty, fields, preview, normalize, customSlug }: Props<T>) {
  const csrf = useCsrfToken();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [list, setList] = useState<CmsList<T>>();
  const [current, setCurrent] = useState<CmsDraft<T>>();
  const [form, setForm] = useState<T>();
  const [position, setPosition] = useState(0);
  const [slug, setSlug] = useState("");
  const [sample, setSample] = useState<T>();
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState<CmsRequestError>();

  const dirty = form !== undefined && current !== undefined &&
    (form !== current.payload || position !== current.position || slug !== current.slug);

  useEffect(() => {
    const abort = new AbortController();
    listContent<T>(kind, abort.signal, page).then((result) => {
      if (!abort.signal.aborted) setList(result);
    }).catch((cause: unknown) => {
      if (!abort.signal.aborted) setError(cause instanceof CmsRequestError ? cause : new CmsRequestError(503, "No se pudo cargar el catálogo."));
    });
    return () => abort.abort();
  }, [kind, page, revision]);

  function open(row?: CmsDraft<T>) {
    setCurrent(row);
    setForm(row?.payload ?? empty);
    setPosition(row?.position ?? 0);
    setSlug(row?.slug ?? "");
    setSample(undefined);
    setNotice("");
    setError(undefined);
  }

  async function operation(run: () => Promise<void>) {
    setWorking(true);
    setError(undefined);
    setNotice("");
    try {
      await run();
    } catch (cause) {
      setError(cause instanceof CmsRequestError ? cause : new CmsRequestError(503, "No se pudo completar la operación."));
    } finally {
      setWorking(false);
    }
  }

  function store(row: CmsDraft<T>, message: string) {
    open(row);
    setNotice(message);
    setRevision((value) => value + 1);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    void operation(async () => {
      const input = { ...form, title: form.title.trim() };
      const entrySlug = slug.trim() || current?.slug || slugFor(input.title);
      if (!entrySlug) throw new CmsRequestError(422, "Escribe un nombre que incluya letras o números.");
      store(await writeDraft(kind, { slug: entrySlug, position, payload: normalize?.(input) ?? input }, csrf, current), "Borrador guardado.");
    });
  }

  function transition(action: ContentAction, message: string) {
    if (!current) return;
    if ((action === "withdraw" || action === "archive") && !window.confirm("¿Confirmas retirar este contenido?")) return;
    void operation(async () => store(await changeContent<T>(kind, current, action, csrf), message));
  }

  return <div className="admin-catalog">
    {error ? <StatusPanel kind="error">
      <p>{error.message}</p>
      {error.fieldErrors ? <ul>{Object.entries(error.fieldErrors).map(([field, message]) =>
        <li key={field}>{message}</li>)}</ul> : null}
      {error.status === 409 || error.status === 503 ? <button type="button" onClick={() => {
        setError(undefined);
        setRevision((value) => value + 1);
      }}>Actualizar listado</button> : null}
    </StatusPanel> : null}
    {notice ? <p role="status">{notice}</p> : null}
    {!list && !error ? <StatusPanel kind="loading">Cargando catálogo…</StatusPanel> : null}
    {list && list.items.length === 0 ? <StatusPanel kind="empty">Aún no hay entradas.</StatusPanel> : null}
    {list && list.items.length > 0 ? <div className="admin-table-scroll"><table>
      <thead><tr><th scope="col">Nombre</th><th scope="col">Orden</th><th scope="col">Estado</th><th scope="col">Acción</th></tr></thead>
      <tbody>{list.items.map((row) => <tr key={row.id}>
        <th scope="row">{row.payload.title}</th><td>{row.position}</td><td>{row.archived ? "Archivado" : states[row.state]}</td>
        <td><button type="button" disabled={working} aria-label={`Abrir ${row.payload.title}`} onClick={() => open(row)}>Abrir</button></td>
      </tr>)}</tbody>
    </table></div> : null}
    <div className="admin-editor-actions">
      <button type="button" disabled={working} onClick={() => open()}>Crear {noun}</button>
      {page > 1 ? <button type="button" onClick={() => setPage((value) => value - 1)}>Anterior</button> : null}
      {list && page * list.pageSize < list.total ? <button type="button" onClick={() => setPage((value) => value + 1)}>Siguiente</button> : null}
    </div>
    {form ? <form method="post" className="admin-editor" onSubmit={save}>
      <fieldset disabled={working || current?.archived}>
        <legend>{current ? "Editar" : "Crear"} {noun}</legend>
        <Field id="editorial-title" label="Nombre" value={form.title} required maxLength={160}
          onChange={(event) => setForm({ ...form, title: event.target.value })} />
        {customSlug ? <Field id="editorial-slug" label="Slug" maxLength={100} value={slug}
          hint="Se genera desde el nombre si está vacío. El slug se conserva desde la primera publicación."
          onChange={(event) => setSlug(event.target.value)} /> : null}
        <Field id="editorial-position" label="Orden" type="number" min={0} max={2147483647} required value={position}
          onChange={(event) => setPosition(event.currentTarget.valueAsNumber || 0)} />
        {fields(form, setForm)}
      </fieldset>
      {dirty ? <p role="status">Hay cambios sin guardar.</p> : null}
      <div className="admin-editor-actions">
        <button type="submit" disabled={working || current?.archived}>Guardar borrador</button>
        {current ? <button type="button" disabled={working || dirty} onClick={() => {
          void operation(async () => setSample((await previewContent<T>(kind, current.id)).payload));
        }}>Previsualizar</button> : null}
        {current ? actions.filter(([action]) => available(action, current)).map(([action, label, message]) =>
          <button key={action} type="button" disabled={working || dirty} onClick={() => transition(action, message)}>{label}</button>) : null}
      </div>
    </form> : null}
    {sample ? <section className="admin-preview" aria-label="Vista previa del borrador">
      <h2>{sample.title}</h2>{preview(sample)}
      <button type="button" onClick={() => setSample(undefined)}>Cerrar vista previa</button>
    </section> : null}
  </div>;
}
