"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  editMedia, listMedia, previewMedia, removeMedia, supportedMedia, uploadMedia,
} from "@/lib/cms/media-client";
import type { Asset, AssetPage, AssetType } from "@/types/cms/media";
import { useCsrfToken } from "./AdminSession";
import { Field } from "./Field";
import { StatusPanel } from "./StatusPanel";

const labels = { READY: "Disponible", RETIRED: "Retirado", STAGED: "En preparación", DELETING: "Eliminación pendiente" };

export function MediaLibrary() {
  const csrf = useCsrfToken();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<AssetType>();
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<AssetPage>();
  const [selected, setSelected] = useState<Asset>();
  const [preview, setPreview] = useState<string>();
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [issue, setIssue] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    listMedia(page, filter, abort.signal).then((result) => {
      if (!abort.signal.aborted) setData(result);
    }).catch((error: unknown) => {
      if (!abort.signal.aborted) setIssue(error instanceof Error ? error.message : "No se pudo cargar la biblioteca.");
    });
    return () => abort.abort();
  }, [page, filter, revision]);

  async function operation(action: () => Promise<void>) {
    setWorking(true);
    setIssue("");
    setNotice("");
    try {
      await action();
    } catch (error) {
      setIssue(error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally {
      setWorking(false);
    }
  }

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get("file");
    if (!(file instanceof File) || !file.size) {
      setIssue("Selecciona un archivo.");
      return;
    }
    void operation(async () => {
      const asset = await uploadMedia(file, csrf);
      setSelected(asset);
      setPreview(undefined);
      setNotice("Archivo guardado.");
      setPage(1);
      setRevision((value) => value + 1);
      form.reset();
    });
  }

  function save(retire = false) {
    if (!selected || (retire && !window.confirm("¿Retirar este archivo de la biblioteca?"))) return;
    void operation(async () => {
      setSelected(await editMedia(selected, csrf, retire));
      setNotice(retire ? "Archivo retirado." : "Datos guardados.");
      setRevision((value) => value + 1);
    });
  }

  function deleteFile() {
    if (!selected || !window.confirm("¿Eliminar definitivamente este archivo sin referencias?")) return;
    void operation(async () => {
      await removeMedia(selected, csrf);
      setSelected(undefined);
      setPreview(undefined);
      setNotice("Archivo eliminado.");
      setRevision((value) => value + 1);
    });
  }

  return (
    <div className="admin-catalog">
      {issue ? <StatusPanel kind="error"><p>{issue}</p>
        <button type="button" onClick={() => { setIssue(""); setData(undefined); setRevision((value) => value + 1); }}>Actualizar biblioteca</button>
      </StatusPanel> : null}
      {notice ? <p role="status">{notice}</p> : null}
      <form className="admin-editor" method="post" onSubmit={upload}>
        <fieldset disabled={working}>
          <legend>Subir archivo</legend>
          <Field id="media-file" label="Archivo" name="file" type="file" accept={supportedMedia.join(",")} required
            hint="Imágenes JPG, PNG o WebP de hasta 15 MiB. Videos MP4 o WebM de hasta 100 MiB." />
          <div><button type="submit">{working ? "Procesando…" : "Subir archivo"}</button></div>
        </fieldset>
      </form>
      <div className="admin-field">
        <label htmlFor="media-filter">Filtrar biblioteca</label>
        <select id="media-filter" value={filter ?? ""} onChange={(event) => {
          setFilter((event.target.value || undefined) as AssetType | undefined);
          setPage(1);
          setData(undefined);
          setIssue("");
        }}>
          <option value="">Todos</option><option value="image">Imágenes</option><option value="video">Videos</option>
        </select>
      </div>
      {!data && !issue ? <StatusPanel kind="loading">Cargando biblioteca…</StatusPanel> : null}
      {data && !data.items.length ? <StatusPanel kind="empty">Aún no hay archivos en este filtro.</StatusPanel> : null}
      {data?.items.length ? <div className="admin-table-scroll">
        <table>
          <thead><tr><th scope="col">Archivo</th><th scope="col">Formato</th><th scope="col">Estado</th><th scope="col">Acción</th></tr></thead>
          <tbody>{data.items.map((asset) => <tr key={asset.id}>
            <th scope="row">{asset.title || asset.originalName}</th><td>{asset.mime}</td><td>{labels[asset.status]}</td>
            <td><button type="button" aria-label={`Abrir ${asset.title || asset.originalName}`} onClick={() => {
              setSelected(asset);
              setPreview(undefined);
              setNotice("");
            }}>Abrir</button></td>
          </tr>)}</tbody>
        </table>
      </div> : null}
      <div className="admin-editor-actions">
        {page > 1 ? <button type="button" onClick={() => setPage((value) => value - 1)}>Anterior</button> : null}
        {data && page * data.pageSize < data.total ? <button type="button" onClick={() => setPage((value) => value + 1)}>Siguiente</button> : null}
      </div>
      {selected ? (
        <form className="admin-editor" method="post" onSubmit={(event) => { event.preventDefault(); save(); }}>
          <fieldset disabled={working}>
            <legend>{selected.originalName}</legend>
            <Field id="media-title" label="Título del archivo" maxLength={160} value={selected.title}
              onChange={(event) => setSelected({ ...selected, title: event.target.value })} />
            <Field id="media-alt" label="Texto alternativo" maxLength={300} value={selected.alt}
              onChange={(event) => setSelected({ ...selected, alt: event.target.value })} />
            <div className="admin-editor-actions">
              <button type="submit">Guardar datos</button>
              {selected.status === "READY" || selected.status === "RETIRED" ? (
                <button type="button" onClick={() => void operation(async () => setPreview((await previewMedia(selected.id, csrf)).url))}>
                  Previsualizar
                </button>
              ) : null}
              {selected.status === "READY" ? <button type="button" onClick={() => save(true)}>Retirar archivo</button> : null}
              <button type="button" onClick={deleteFile}>Eliminar archivo</button>
            </div>
          </fieldset>
        </form>
      ) : null}
      {selected && preview ? (
        <section className="admin-preview" aria-label="Vista previa multimedia">
          {selected.mime.startsWith("image/") ? <Image src={preview} alt={selected.alt || selected.originalName}
            width={selected.width ?? 400} height={selected.height ?? 300} unoptimized />
            : <video src={preview} controls preload="metadata" aria-label={selected.title || selected.originalName} />}
          <div><button type="button" onClick={() => setPreview(undefined)}>Cerrar vista previa</button></div>
        </section>
      ) : null}
    </div>
  );
}
