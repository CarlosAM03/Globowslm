import { Controller, Get, Header, Module } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/access.js";
import { DatabaseModule, DatabaseService } from "../database.js";
import { ContentKind, type Prisma } from "../generated/prisma/client.js";
import { parsePayload } from "./dto.js";

const publicKinds = [
  ContentKind.SITE, ContentKind.SERVICE, ContentKind.EVENT_TYPE, ContentKind.GALLERY_CATEGORY,
  ContentKind.GALLERY, ContentKind.TRAINING, ContentKind.CERTIFICATION,
];
const select = {
  slug: true, payload: true, position: true,
  publishedFor: { select: { id: true, kind: true } },
  media: { select: { role: true, position: true, media: {
    select: { id: true, mime: true, width: true, height: true, alt: true, status: true },
  } } },
} satisfies Prisma.RevisionSelect;

type Row = Prisma.RevisionGetPayload<{ select: typeof select }>;

function mediaFor(row: Row, role: string, position = 0) {
  const ref = row.media.find((item) => item.role === role && item.position === position)?.media;
  if (!ref || ref.status !== "READY") return null;
  const { id, mime, width, height, alt } = ref;
  return { id, mime, width, height, alt };
}

function view(rows: Row[]) {
  const publicEntries = new Map(rows.flatMap((row) => row.publishedFor ? [[row.publishedFor.id, row.slug] as const] : []));
  return rows.flatMap<{ kind: ContentKind; slug: string; position: number; data: object }>((row) => {
    if (!row.publishedFor) return [];
    const payload = parsePayload(row.publishedFor.kind, row.payload);
    const slug = row.slug;
    const { position } = row;
    switch (payload.kind) {
      case "SITE": {
        const { brandName, founderName, hero, about, trajectory, contact, faq, seo } = payload.data;
        return [{ kind: payload.kind, slug, position, data: {
          brandName, founderName, trajectory, contact, faq, seo,
          hero: { title: hero.title, subtitle: hero.subtitle, photo: mediaFor(row, "hero") },
          about: { title: about.title, history: about.history, philosophy: about.philosophy, portrait: mediaFor(row, "portrait") },
        } }];
      }
      case "SERVICE": {
        const { title, description, ctaInterest, eventTypes } = payload.data;
        return [{ kind: payload.kind, slug, position, data: {
          title, description, ctaInterest, image: mediaFor(row, "image"),
          eventTypes: (eventTypes ?? []).flatMap((id) => publicEntries.get(id) ?? []),
        } }];
      }
      case "EVENT_TYPE": {
        const { title, description } = payload.data;
        return [{ kind: payload.kind, slug, position, data: { title, description, image: mediaFor(row, "image") } }];
      }
      case "GALLERY_CATEGORY":
        return [{ kind: payload.kind, slug, position, data: payload.data }];
      case "GALLERY": {
        const { title, categoryRef, featured, orderedPhotoRefs } = payload.data;
        const category = publicEntries.get(categoryRef);
        if (!category) return [];
        return [{ kind: payload.kind, slug, position, data: {
          title, category, featured, photos: orderedPhotoRefs.flatMap(({ alt, caption }, index) => {
            const media = mediaFor(row, "photo", index);
            return media ? [{ ...media, alt: alt || media.alt, caption }] : [];
          }),
        } }];
      }
      case "TRAINING": {
        const { title, description, trainingType, ctaInterest } = payload.data;
        return [{ kind: payload.kind, slug, position, data: { title, description, trainingType, ctaInterest,
          photo: mediaFor(row, "photo"), video: mediaFor(row, "video") } }];
      }
      case "CERTIFICATION": {
        const { title, issuer, date, description, verified, evidenceMediaRefs } = payload.data;
        if (!verified || !issuer) return [];
        return [{ kind: payload.kind, slug, position, data: { title, issuer, date, description,
          evidence: evidenceMediaRefs.flatMap((_, index) => mediaFor(row, "evidence", index) ?? []) } }];
      }
      default: return [];
    }
  });
}

@ApiTags("public site")
@Public()
@Controller("public/site")
class PublicSiteController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  async read() {
    const rows = await this.database.revision.findMany({
      where: { publishedFor: { is: { kind: { in: publicKinds } } } },
      orderBy: [{ position: "asc" }, { id: "asc" }], select,
    });
    const content = view(rows);
    return {
      site: content.find(({ kind }) => kind === "SITE")?.data ?? null,
      services: content.filter(({ kind }) => kind === "SERVICE"),
      eventTypes: content.filter(({ kind }) => kind === "EVENT_TYPE"),
      categories: content.filter(({ kind }) => kind === "GALLERY_CATEGORY"),
      galleries: content.filter(({ kind }) => kind === "GALLERY"),
      training: content.filter(({ kind }) => kind === "TRAINING"),
      certifications: content.filter(({ kind }) => kind === "CERTIFICATION"),
    };
  }
}

@Module({ imports: [DatabaseModule], controllers: [PublicSiteController] })
export class PublicSiteModule {}
