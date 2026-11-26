"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { listContent } from "@/lib/cms/content-client";
import { previewMedia } from "@/lib/cms/media-client";
import type { CmsDraft } from "@/types/cms/content";
import { useCsrfToken } from "./AdminSession";
import { EditorialCatalog } from "./EditorialCatalog";
import { Field } from "./Field";
import { MediaSelect } from "./MediaSelect";
import { StatusPanel } from "./StatusPanel";

type Category = { title: string; description?: string };
type Photo = { mediaRef: string; alt: string; caption?: string };
type Gallery = { title: string; categoryRef: string; featured: boolean; orderedPhotoRefs: Photo[] };

const category: Category = { title: "" };
const gallery: Gallery = { title: "", categoryRef: "", featured: false, orderedPhotoRefs: [] };

function CategoryFields({ draft, change }: { draft: Category; change: (draft: Category) => void }) {
  return <div className="admin-field">
    <label htmlFor="gallery-category-description">Descripción</label>
    <textarea id="gallery-category-description" maxLength={4000} rows={3} value={draft.description ?? ""}
      onChange={(event) => change({ ...draft, description: event.target.value })} />
  </div>;
}

function GalleryFields({ draft, change }: { draft: Gallery; change: (draft: Gallery) => void }) {
  const [categories, setCategories] = useState<CmsDraft<Category>[]>([]);
  const [categoryState, setCategoryState] = useState<"loading" | "ready" | "error">("loading");
  const [selected, setSelected] = useState<string>();

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      const first = await listContent<Category>("gallery_category", abort.signal);
      const rows = [...first.items];
      for (let page = 2; page <= Math.ceil(first.total / first.pageSize); page++) {
        rows.push(...(await listContent<Category>("gallery_category", abort.signal, page)).items);
      }
      if (abort.signal.aborted) return;
      setCategories(rows.filter(({ archived }) => !archived));
      setCategoryState("ready");
    }
    void load().catch(() => { if (!abort.signal.aborted) setCategoryState("error"); });
    return () => abort.abort();
  }, []);

  function setPhotos(orderedPhotoRefs: Photo[]) {
    change({ ...draft, orderedPhotoRefs });
  }

  function move(index: number, direction: -1 | 1) {
    const photos = [...draft.orderedPhotoRefs];
    [photos[index], photos[index + direction]] = [photos[index + direction], photos[index]];
    setPhotos(photos);
  }

  function changePhoto(index: number, photo: Photo) {
    setPhotos(draft.orderedPhotoRefs.map((original, offset) => offset === index ? photo : original));
  }

  const canAdd = selected && !draft.orderedPhotoRefs.some(({ mediaRef }) => mediaRef === selected) && draft.orderedPhotoRefs.length < 100;

  return <>
    <div className="admin-field">
      <label htmlFor="gallery-category">Categoría de decoración</label>
      <select id="gallery-category" required value={draft.categoryRef} aria-describedby="gallery-category-hint"
        onChange={(event) => change({ ...draft, categoryRef: event.target.value })}>
        <option value="">Selecciona una categoría</option>
        {draft.categoryRef && !categories.some(({ id }) => id === draft.categoryRef) ?
          <option value={draft.categoryRef}>Categoría actual</option> : null}
        {categories.map(({ id, payload, state }) => <option key={id} value={id}>
          {payload.title}{state !== "PUBLISHED" ? " (sin publicar)" : ""}
        </option>)}
      </select>
      <small id="gallery-category-hint">{
        categoryState === "loading" ? "Cargando categorías…" : categoryState === "error" ? "No se pudieron cargar las categorías."
          : "Para publicar la galería, publica su categoría primero."
      }</small>
    </div>
    <label className="admin-check"><input type="checkbox" checked={draft.featured}
      onChange={(event) => change({ ...draft, featured: event.target.checked })} />Galería destacada</label>
    <fieldset>
      <legend>Fotografías en orden de presentación</legend>
      <MediaSelect id="gallery-add-image" label="Fotografía para agregar" type="image" value={selected} onChange={setSelected} />
      <button type="button" disabled={!canAdd} onClick={() => {
        if (!selected) return;
        setPhotos([...draft.orderedPhotoRefs, { mediaRef: selected, alt: "" }]);
        setSelected(undefined);
      }}>Agregar fotografía</button>
      {draft.orderedPhotoRefs.length > 0 ? <ol>{draft.orderedPhotoRefs.map((photo, index) =>
        <li key={photo.mediaRef}>
          <fieldset>
            <legend>Fotografía {index + 1}</legend>
            <Field id={`gallery-alt-${photo.mediaRef}`} label={`Texto alternativo de la foto ${index + 1}`}
              value={photo.alt} maxLength={300} onChange={(event) => changePhoto(index, { ...photo, alt: event.target.value })} />
            <Field id={`gallery-caption-${photo.mediaRef}`} label={`Pie de foto ${index + 1}`}
              value={photo.caption ?? ""} maxLength={160} onChange={(event) => changePhoto(index, { ...photo, caption: event.target.value })} />
            <div className="admin-editor-actions">
              <button type="button" aria-label={`Subir foto ${index + 1}`} disabled={index === 0} onClick={() => move(index, -1)}>Subir</button>
              <button type="button" aria-label={`Bajar foto ${index + 1}`} disabled={index + 1 === draft.orderedPhotoRefs.length} onClick={() => move(index, 1)}>Bajar</button>
              <button type="button" aria-label={`Quitar foto ${index + 1}`}
                onClick={() => setPhotos(draft.orderedPhotoRefs.filter((_, offset) => offset !== index))}>Quitar</button>
            </div>
          </fieldset>
        </li>
      )}</ol> : <p>Agrega al menos una foto para publicar.</p>}
    </fieldset>
  </>;
}

function GalleryPreview({ gallery }: { gallery: Gallery }) {
  const csrf = useCsrfToken();
  const [sources, setSources] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string>();
  const [error, setError] = useState("");

  async function load(photo: Photo) {
    setPending(photo.mediaRef);
    setError("");
    try {
      const { url } = await previewMedia(photo.mediaRef, csrf);
      setSources((previous) => ({ ...previous, [photo.mediaRef]: url }));
    } catch {
      setError("La foto no está disponible para previsualización.");
    } finally {
      setPending(undefined);
    }
  }

  return <>
    {error ? <StatusPanel kind="error">{error}</StatusPanel> : null}
    <ol>{gallery.orderedPhotoRefs.map((photo, index) =>
      <li key={photo.mediaRef}>
        {sources[photo.mediaRef] ? <Image src={sources[photo.mediaRef]} alt={photo.alt}
          width={420} height={280} unoptimized /> : null}
        <p>{photo.caption || photo.alt || `Fotografía ${index + 1}`}</p>
        <button type="button" disabled={!!pending} onClick={() => void load(photo)}>Ver fotografía {index + 1}</button>
      </li>
    )}</ol>
  </>;
}

export function GalleryCatalog() {
  const [kind, setKind] = useState<"gallery" | "gallery_category">("gallery");
  return <>
    <div className="admin-editor-actions" aria-label="Catálogos">
      <button type="button" aria-pressed={kind === "gallery"} onClick={() => setKind("gallery")}>Galerías</button>
      <button type="button" aria-pressed={kind === "gallery_category"} onClick={() => setKind("gallery_category")}>Categorías</button>
    </div>
    {kind === "gallery" ? <EditorialCatalog key={kind} kind={kind} noun="galería" empty={gallery}
      fields={(draft, change) => <GalleryFields draft={draft} change={change} />}
      normalize={(draft) => ({ ...draft, orderedPhotoRefs: draft.orderedPhotoRefs.map((photo) =>
        ({ ...photo, alt: photo.alt.trim(), caption: photo.caption?.trim() || undefined })) })}
      preview={(draft) => <GalleryPreview gallery={draft} />} /> :
      <EditorialCatalog key={kind} kind={kind} noun="categoría" empty={category}
        fields={(draft, change) => <CategoryFields draft={draft} change={change} />}
        normalize={(draft) => ({ ...draft, description: draft.description?.trim() || undefined })}
        preview={(draft) => <p>{draft.description}</p>} />}
  </>;
}
