import { Controller, Get, Header, Module, NotFoundException, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { Public } from "../auth/access.js";
import { DatabaseModule, DatabaseService } from "../database.js";
import type { Prisma } from "../generated/prisma/client.js";
import { parsePayload, slug, validationError, type ValidatedPayload } from "./dto.js";

const listQuery = z.strictObject({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  category: slug.optional(),
});
const pageSize = 10;

const selectPost = {
  slug: true, payload: true, publishedAt: true,
  media: { select: { role: true, position: true, media: {
    select: { id: true, mime: true, width: true, height: true, alt: true, status: true },
  } } },
  entries: { where: { role: "category" }, orderBy: { position: "asc" }, select: {
    target: { select: { kind: true, publishedRevision: { select: { slug: true, payload: true } } } },
  } },
} satisfies Prisma.RevisionSelect;

type PostRow = Prisma.RevisionGetPayload<{ select: typeof selectPost }>;
type Post = Extract<ValidatedPayload, { kind: "POST" }>["data"];

function data<K extends ValidatedPayload["kind"]>(kind: K, raw: unknown) {
  return parsePayload(kind, raw).data as Extract<ValidatedPayload, { kind: K }>["data"];
}

function asset(row: PostRow["media"][number]["media"] | undefined) {
  if (!row || row.status !== "READY") return null;
  const { id, mime, width, height, alt } = row;
  return { id, mime, width, height, alt };
}

function summary(row: PostRow) {
  const { title, excerpt, tags } = data("POST", row.payload);
  const categories = row.entries.flatMap(({ target }) => {
    const revision = target.publishedRevision;
    return target.kind === "BLOG_CATEGORY" && revision
      ? [{ slug: revision.slug, title: data("BLOG_CATEGORY", revision.payload).title }] : [];
  });
  const cover = asset(row.media.find((ref) => ref.role === "cover" && ref.position === 0)?.media);
  return {
    slug: row.slug, title, excerpt, tags, categories, cover: cover?.mime.startsWith("image/") ? cover : null,
    author: "Globows LM", publishedAt: row.publishedAt.toISOString(),
  };
}

function post(row: PostRow) {
  const { blocks } = data("POST", row.payload);
  const media = new Map(row.media.filter(({ role }) => role === "block").map((ref) => [ref.position, ref.media]));
  const details = blocks.flatMap((block, index): Array<
    Exclude<Post["blocks"][number], { type: "image" | "video" }> |
    { type: "image" | "video"; media: NonNullable<ReturnType<typeof asset>>; caption?: string; alt?: string }
  > => {
    if (block.type !== "image" && block.type !== "video") return [block];
    const resolved = asset(media.get(index));
    if (!resolved || !resolved.mime.startsWith(`${block.type}/`)) return [];
    return [{
      type: block.type, media: resolved, caption: block.caption,
      ...(block.type === "image" && { alt: block.alt }),
    }];
  });
  return { ...summary(row), blocks: details };
}

@ApiTags("public blog")
@Public()
@Controller("public/posts")
class BlogController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  async list(@Query() raw: unknown) {
    const parsed = listQuery.safeParse(raw);
    if (!parsed.success) throw validationError(parsed.error);
    const { page, category } = parsed.data;
    const where: Prisma.RevisionWhereInput = {
      publishedFor: { is: { kind: "POST" } },
      ...(category && { entries: { some: { role: "category", target: {
        kind: "BLOG_CATEGORY", slug: category, publishedRevisionId: { not: null },
      } } } }),
    };
    const [items, total, categories] = await this.db.$transaction([
      this.db.revision.findMany({
        where, select: selectPost, orderBy: [{ publishedAt: "desc" }, { id: "asc" }], skip: (page - 1) * pageSize, take: pageSize,
      }),
      this.db.revision.count({ where }),
      this.db.revision.findMany({
        where: { publishedFor: { is: { kind: "BLOG_CATEGORY" } } },
        select: { slug: true, payload: true }, orderBy: [{ position: "asc" }, { slug: "asc" }],
      }),
    ]);
    return { items: items.map(summary), total, page, pageSize, categories: categories.map((row) => ({
      slug: row.slug, title: data("BLOG_CATEGORY", row.payload).title,
    })) };
  }

  @Get(":slug")
  @Header("Cache-Control", "no-store")
  async find(@Param("slug") raw: string) {
    if (!slug.safeParse(raw).success) throw new NotFoundException();
    const row = await this.db.revision.findFirst({ where: { slug: raw, publishedFor: { is: { kind: "POST" } } }, select: selectPost });
    if (!row) throw new NotFoundException();
    return post(row);
  }
}

@Module({ imports: [DatabaseModule], controllers: [BlogController] })
export class PublicBlogModule {}
