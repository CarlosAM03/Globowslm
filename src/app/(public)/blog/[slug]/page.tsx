import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogArticle } from "@/components/blog/BlogContent";
import { readPost } from "@/lib/cms/public-blog";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await readPost(slug);
  return {
    title: result.state === "ready" ? result.data.title : "Blog de Globows LM",
    description: result.state === "ready" ? result.data.excerpt : undefined,
    robots: { index: false, follow: false },
  };
}

async function Article({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const result = await readPost(slug);
  if (result.state === "missing") notFound();
  return result.state === "ready" ? <BlogArticle article={result.data} /> :
    <p role="status">La publicación no está disponible en este momento.</p>;
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return <main id="contenido" className="section blog-page">
    <Link href="/blog">Volver al blog</Link>
    <Suspense fallback={<p role="status">Cargando publicación…</p>}>
      <Article params={params} />
    </Suspense>
  </main>;
}
