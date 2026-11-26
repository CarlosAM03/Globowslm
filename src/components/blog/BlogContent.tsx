import { PublishedImage } from "@/components/shared/PublishedImage";
import Link from "next/link";
import type { PostBlock, PostPage, PublicAsset, PublicPost } from "@/types/cms/public-blog";

const dateFormat = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Tijuana" });

export function AssetImage({ asset, alt, sizes = "(max-width: 760px) 100vw, 720px" }: { asset: PublicAsset; alt?: string; sizes?: string }) {
  return <PublishedImage src={`/api/cms/public/media/${asset.id}`} width={asset.width ?? 720} height={asset.height ?? 480}
    alt={alt ?? asset.alt} sizes={sizes} />;
}

function Block({ block }: { block: PostBlock }) {
  if (block.type === "paragraph") return <p>{block.text}</p>;
  if (block.type === "heading") return block.level === 3 ? <h3>{block.text}</h3> : <h2>{block.text}</h2>;
  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return <List>{block.items.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</List>;
  }
  return <figure>
    {block.type === "image" ? <AssetImage asset={block.media} alt={block.alt} /> :
      <video controls preload="metadata" src={`/api/cms/public/media/${block.media.id}`} aria-label={block.caption || "Video de la publicación"} />}
    {block.caption ? <figcaption>{block.caption}</figcaption> : null}
  </figure>;
}

function blogUrl(page: number, category?: string) {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  if (category) query.set("category", category);
  return query.size ? `/blog?${query}` : "/blog";
}

export function BlogIndex({ data, category }: { data: PostPage; category?: string }) {
  return <>
    {data.categories.length ? <nav aria-label="Categorías del blog" className="blog-filters">
      <Link href="/blog" aria-current={!category ? "page" : undefined}>Todas</Link>
      {data.categories.map((group) => <Link key={group.slug} href={blogUrl(1, group.slug)}
        aria-current={group.slug === category ? "page" : undefined}>{group.title}</Link>)}
    </nav> : null}
    {data.items.length ? <ul className="blog-list">{data.items.map((entry) => <li key={entry.slug}>
      <article>
        {entry.cover ? <AssetImage asset={entry.cover} /> : null}
        <h2><Link href={`/blog/${entry.slug}`}>{entry.title}</Link></h2>
        <p>{entry.excerpt}</p>
        <time dateTime={entry.publishedAt}>{dateFormat.format(new Date(entry.publishedAt))}</time>
      </article>
    </li>)}</ul> : <p>Aún no hay publicaciones para esta vista.</p>}
    {data.page > 1 || data.page * data.pageSize < data.total ? <nav className="blog-filters" aria-label="Páginas del blog">
      {data.page > 1 ? <Link href={blogUrl(data.page - 1, category)}>Anterior</Link> : null}
      {data.page * data.pageSize < data.total ? <Link href={blogUrl(data.page + 1, category)}>Siguiente</Link> : null}
    </nav> : null}
  </>;
}

export function BlogArticle({ article }: { article: PublicPost }) {
  return <article className="blog-article">
    <header>
      <h1>{article.title}</h1>
      <p>{article.excerpt}</p>
      <p>{article.author} · <time dateTime={article.publishedAt}>{dateFormat.format(new Date(article.publishedAt))}</time></p>
      {article.categories.length ? <ul className="blog-filters" aria-label="Categorías">
        {article.categories.map((category) => <li key={category.slug}>
          <Link href={blogUrl(1, category.slug)}>{category.title}</Link>
        </li>)}
      </ul> : null}
      {article.tags.length ? <p>{article.tags.join(" · ")}</p> : null}
    </header>
    {article.cover ? <AssetImage asset={article.cover} /> : null}
    {article.blocks.map((block, index) => <Block key={index} block={block} />)}
  </article>;
}
