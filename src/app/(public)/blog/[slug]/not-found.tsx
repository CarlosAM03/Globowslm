import Link from "next/link";

export default function BlogNotFound() {
  return <section className="blog-article">
    <h1>Publicación no encontrada</h1>
    <p>Consulta las publicaciones disponibles en el blog.</p>
    <Link href="/blog">Ver publicaciones</Link>
  </section>;
}
