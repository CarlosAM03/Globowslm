"use client";

import { useEffect, useState } from "react";
import { listContent } from "@/lib/cms/content-client";
import type { CmsDraft } from "@/types/cms/content";
import type { TextBlock } from "@/types/cms/public-blog";
import { EditorialCatalog } from "./EditorialCatalog";
import { EditorialMediaPreview } from "./EditorialMediaPreview";
import { Field } from "./Field";
import { MediaSelect } from "./MediaSelect";

type Category = { title: string; description?: string };
type Block = TextBlock | { type: "image" | "video"; mediaRef: string; alt?: string; caption?: string };
type Post = { title: string; excerpt: string; blocks: Block[]; coverRef?: string; categoryRefs: string[]; tags: string[] };

const blankCategory: Category = { title: "" };
const blankPost: Post = { title: "", excerpt: "", blocks: [], categoryRefs: [], tags: [] };
const blockOptions = {
  paragraph: "Párrafo", heading: "Encabezado", list: "Lista", image: "Imagen", video: "Video",
} as const;
const blockTypes = Object.keys(blockOptions) as Block["type"][];

function makeBlock(type: Block["type"]): Block {
  switch (type) {
    case "paragraph": return { type, text: "" };
    case "heading": return { type, text: "", level: 2 };
    case "list": return { type, items: [""], ordered: false };
    case "image":
    case "video": return { type, mediaRef: "" };
  }
}

function BlockFields({ block, index, change }: { block: Block; index: number; change: (next: Block) => void }) {
  const id = `blog-block-${index}`;
  if (block.type === "paragraph" || block.type === "heading") return <>
    <div className="admin-field">
      <label htmlFor={`${id}-text`}>Texto</label>
      <textarea required id={`${id}-text`} rows={block.type === "heading" ? 2 : 5} maxLength={5000} value={block.text}
        onChange={(event) => change({ ...block, text: event.target.value })} />
    </div>
    {block.type === "heading" ? <div className="admin-field">
      <label htmlFor={`${id}-level`}>Nivel del encabezado</label>
      <select id={`${id}-level`} value={block.level}
        onChange={(event) => change({ ...block, level: event.target.value === "3" ? 3 : 2 })}>
        <option value="2">Título de sección</option><option value="3">Subtítulo</option>
      </select>
    </div> : null}
  </>;
  if (block.type === "list") return <>
    <div className="admin-field">
      <label htmlFor={`${id}-items`}>Elementos, uno por línea</label>
      <textarea required id={`${id}-items`} rows={4} value={block.items.join("\n")}
        onChange={(event) => change({ ...block, items: event.target.value.split("\n") })} />
    </div>
    <label className="admin-check">
      <input type="checkbox" checked={block.ordered} onChange={(event) => change({ ...block, ordered: event.target.checked })} />
      Numerar lista
    </label>
  </>;
  return <>
    <MediaSelect id={`${id}-media`} label={blockOptions[block.type]} type={block.type} value={block.mediaRef}
      onChange={(mediaRef) => change({ ...block, mediaRef: mediaRef ?? "" })} />
    {block.type === "image" ? <Field id={`${id}-alt`} label="Texto alternativo" maxLength={300} value={block.alt ?? ""}
      onChange={(event) => change({ ...block, alt: event.target.value })} /> : null}
    <Field id={`${id}-caption`} label="Pie del archivo" maxLength={5000} value={block.caption ?? ""}
      onChange={(event) => change({ ...block, caption: event.target.value })} />
  </>;
}

function Blocks({ blocks, change }: { blocks: Block[]; change: (next: Block[]) => void }) {
  const [type, setType] = useState<Block["type"]>("paragraph");
  function reorder(index: number, direction: -1 | 1) {
    const next = [...blocks];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    change(next);
  }
  return <fieldset>
    <legend>Bloques de la publicación</legend>
    <div className="admin-field">
      <label htmlFor="blog-block-type">Tipo de bloque</label>
      <select id="blog-block-type" value={type} onChange={(event) => setType(event.target.value as Block["type"])}>
        {blockTypes.map((key) => <option key={key} value={key}>{blockOptions[key]}</option>)}
      </select>
    </div>
    <button type="button" disabled={blocks.length >= 100} onClick={() => change([...blocks, makeBlock(type)])}>Agregar bloque</button>
    {blocks.length ? <ol>{blocks.map((block, index) => <li key={index}>
      <fieldset>
        <legend>{blockOptions[block.type]} {index + 1}</legend>
        <BlockFields key={block.type} index={index} block={block}
          change={(value) => change(blocks.map((previous, offset) => index === offset ? value : previous))} />
        <div className="admin-editor-actions">
          <button type="button" aria-label={`Subir bloque ${index + 1}`} disabled={index === 0} onClick={() => reorder(index, -1)}>Subir</button>
          <button type="button" aria-label={`Bajar bloque ${index + 1}`} disabled={index + 1 === blocks.length}
            onClick={() => reorder(index, 1)}>Bajar</button>
          <button type="button" aria-label={`Quitar bloque ${index + 1}`}
            onClick={() => change(blocks.filter((_, offset) => index !== offset))}>Quitar</button>
        </div>
      </fieldset>
    </li>)}</ol> : null}
  </fieldset>;
}

function PostFields({ post, change }: { post: Post; change: (next: Post) => void }) {
  const [categories, setCategories] = useState<CmsDraft<Category>[]>([]);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      const first = await listContent<Category>("blog_category", abort.signal);
      const rows = [...first.items];
      for (let page = 2; page <= Math.ceil(first.total / first.pageSize); page++) {
        rows.push(...(await listContent<Category>("blog_category", abort.signal, page)).items);
      }
      if (!abort.signal.aborted) setCategories(rows.filter(({ archived }) => !archived));
    }
    void load().catch(() => { if (!abort.signal.aborted) setCategoryError(true); });
    return () => abort.abort();
  }, []);

  return <>
    <div className="admin-field">
      <label htmlFor="blog-excerpt">Resumen</label>
      <textarea id="blog-excerpt" required rows={3} maxLength={300} value={post.excerpt}
        onChange={(event) => change({ ...post, excerpt: event.target.value })} />
    </div>
    <Field id="blog-tags" label="Etiquetas separadas por coma" maxLength={509} value={post.tags.join(",")}
      onChange={(event) => change({ ...post, tags: event.target.value.split(",") })} />
    <MediaSelect id="blog-cover" label="Imagen de portada" type="image" value={post.coverRef}
      onChange={(coverRef) => change({ ...post, coverRef })} />
    <fieldset>
      <legend>Categorías de la publicación</legend>
      {categoryError ? <p role="alert">No se pudieron cargar las categorías.</p> : null}
      {categories.map(({ id, payload, state }) => <label className="admin-check" key={id}>
        <input type="checkbox" checked={post.categoryRefs.includes(id)} onChange={(event) => change({
          ...post, categoryRefs: event.target.checked ? [...post.categoryRefs, id] : post.categoryRefs.filter((value) => value !== id),
        })} />
        {payload.title}{state === "PUBLISHED" ? "" : " (sin publicar)"}
      </label>)}
    </fieldset>
    <Blocks blocks={post.blocks} change={(blocks) => change({ ...post, blocks })} />
  </>;
}

function normalizeBlock(block: Block): Block {
  switch (block.type) {
    case "image": return { ...block, alt: block.alt?.trim() || undefined, caption: block.caption?.trim() || undefined };
    case "video": return { ...block, caption: block.caption?.trim() || undefined };
    case "list": return { ...block, items: block.items.map((value) => value.trim()).filter(Boolean) };
    default: return { ...block, text: block.text.trim() };
  }
}

function DraftPreview({ post }: { post: Post }) {
  return <>
    <p>{post.excerpt}</p>
    {post.coverRef ? <EditorialMediaPreview id={post.coverRef} type="image" label="portada" /> : null}
    {post.blocks.map((block, index) => {
      switch (block.type) {
        case "paragraph": return <p key={index}>{block.text}</p>;
        case "heading": return <h3 key={index}>{block.text}</h3>;
        case "list": {
          const List = block.ordered ? "ol" : "ul";
          return <List key={index}>{block.items.map((item, offset) => <li key={offset}>{item}</li>)}</List>;
        }
        default: return <EditorialMediaPreview key={index} id={block.mediaRef} type={block.type} label={block.caption || blockOptions[block.type]} />;
      }
    })}
  </>;
}

export function BlogCatalog() {
  const [view, setView] = useState<"post" | "blog_category">("post");
  return <>
    <div className="admin-editor-actions" aria-label="Catálogos del blog">
      <button type="button" aria-pressed={view === "post"} onClick={() => setView("post")}>Artículos</button>
      <button type="button" aria-pressed={view === "blog_category"} onClick={() => setView("blog_category")}>Categorías</button>
    </div>
    {view === "post" ? <EditorialCatalog key={view} kind={view} noun="publicación" empty={blankPost} customSlug
      fields={(post, change) => <PostFields post={post} change={change} />}
      preview={(post) => <DraftPreview post={post} />}
      normalize={(post) => ({ ...post, excerpt: post.excerpt.trim(),
        tags: [...new Set(post.tags.map((tag) => tag.trim()).filter(Boolean))], blocks: post.blocks.map(normalizeBlock) })}
      /> : <EditorialCatalog key={view} kind={view} noun="categoría" empty={blankCategory} customSlug
        fields={(category, change) => <div className="admin-field">
          <label htmlFor="blog-category-description">Descripción</label>
          <textarea rows={3} id="blog-category-description" value={category.description ?? ""} maxLength={4000}
            onChange={(event) => change({ ...category, description: event.target.value })} />
        </div>}
        preview={(category) => <p>{category.description}</p>}
        normalize={(category) => ({ ...category, description: category.description?.trim() || undefined })}
      />}
  </>;
}
