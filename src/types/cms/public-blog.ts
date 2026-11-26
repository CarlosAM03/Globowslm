export type PublicAsset = { id: string; mime: string; width: number | null; height: number | null; alt: string };
export type BlogCategory = { slug: string; title: string };
export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  categories: BlogCategory[];
  cover: PublicAsset | null;
  author: string;
  publishedAt: string;
};
export type TextBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level: 2 | 3 }
  | { type: "list"; items: string[]; ordered: boolean };
export type PostBlock = TextBlock | { type: "image" | "video"; media: PublicAsset; alt?: string; caption?: string };
export type PublicPost = PostSummary & { blocks: PostBlock[] };
export type PostPage = { items: PostSummary[]; page: number; total: number; pageSize: number; categories: BlogCategory[] };
