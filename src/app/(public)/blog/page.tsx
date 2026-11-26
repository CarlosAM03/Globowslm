import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BlogIndex } from "@/components/blog/BlogContent";
import { readPosts, validSlug } from "@/lib/cms/public-blog";

export const metadata: Metadata = {
  title: "Blog de Globows LM",
  description: "Publicaciones de Globows LM sobre arte con globos.",
  robots: { index: false, follow: false },
};

async function Entries({ searchParams }: Pick<PageProps<"/blog">, "searchParams">) {
  const query = await searchParams;
  const raw = typeof query.page === "string" ? query.page : "";
  const page = /^[1-9]\d{0,4}$/.test(raw) ? Math.min(Number(raw), 10_000) : 1;
  const category = typeof query.category === "string" && validSlug(query.category) ? query.category : undefined;
  const result = await readPosts(page, category);
  return result.state === "ready" ? <BlogIndex data={result.data} category={category} /> :
    <p role="status">El blog no está disponible en este momento.</p>;
}

export default function BlogPage({ searchParams }: PageProps<"/blog">) {
  return <main id="contenido" className="section blog-page">
    <Link href="/">Inicio</Link>
    <h1>Blog de Globows LM</h1>
    <Suspense fallback={<p role="status">Cargando publicaciones…</p>}>
      <Entries searchParams={searchParams} />
    </Suspense>
  </main>;
}
