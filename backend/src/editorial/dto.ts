import { HttpException } from "@nestjs/common";
import { z } from "zod";
import type { ContentKind } from "../generated/prisma/client.js";

const uuid = z.uuid();
const title = z.string().trim().min(1).max(160);
const description = z.string().trim().min(1).max(4000);
const alt = z.string().trim().max(300);
const ctaInterest = z.enum(["decoracion", "cursos", "talleres", "certificaciones", "asesorias", "general"]);
const contentText = z.string().trim().min(1).max(5000)
  .refine((value) => !/<\/?[a-z][^>]*>/i.test(value), "El texto admite contenido sin etiquetas HTML.");
const refs = z.array(uuid).max(100).refine((ids) => new Set(ids).size === ids.length, "Referencias duplicadas.");
const phone = z.string().regex(/^\+?[1-9]\d{7,14}$/);

function socialLink(hosts: readonly string[]) {
  return z.url().max(2048).refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      !url.port && hosts.includes(url.hostname);
  }, "Usa una URL HTTPS de la red social correspondiente.");
}

const blogBlock = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("paragraph"), text: contentText }),
  z.strictObject({ type: z.literal("heading"), text: contentText, level: z.union([z.literal(2), z.literal(3)]) }),
  z.strictObject({ type: z.literal("list"), items: z.array(contentText).min(1).max(50), ordered: z.boolean().default(false) }),
  z.strictObject({ type: z.literal("image"), mediaRef: uuid, alt: alt.optional(), caption: contentText.optional() }),
  z.strictObject({ type: z.literal("video"), mediaRef: uuid, caption: contentText.optional() }),
]);

const category = z.strictObject({ title, description: description.optional() });
const payloads = {
  SITE: z.strictObject({
    brandName: title, founderName: title,
    hero: z.strictObject({ title, subtitle: description.optional(), photoRef: uuid.optional() }),
    about: z.strictObject({ title, history: description, philosophy: description.optional(), portraitRef: uuid.optional() }),
    trajectory: description.optional(),
    contact: z.strictObject({
      phone: phone.optional(), whatsapp: phone.optional(), email: z.email().max(254).optional(),
      facebook: socialLink(["facebook.com", "www.facebook.com", "m.facebook.com"]).optional(),
      instagram: socialLink(["instagram.com", "www.instagram.com"]).optional(),
      tiktok: socialLink(["tiktok.com", "www.tiktok.com"]).optional(),
    }),
    faq: z.array(z.strictObject({ question: title, answer: description })).max(50),
    seo: z.strictObject({ title, description: z.string().trim().min(1).max(300) }),
  }),
  SERVICE: z.strictObject({ title, description, imageRef: uuid.optional(), eventTypes: refs.optional(), ctaInterest }),
  EVENT_TYPE: z.strictObject({ title, description: description.optional(), imageRef: uuid.optional() }),
  GALLERY_CATEGORY: category,
  GALLERY: z.strictObject({
    title, categoryRef: uuid, featured: z.boolean().default(false),
    orderedPhotoRefs: z.array(z.strictObject({ mediaRef: uuid, alt, caption: title.optional() })).max(100),
  }),
  TRAINING: z.strictObject({
    title, description, trainingType: z.enum(["COURSE", "WORKSHOP", "ADVICE", "CERTIFICATION"]),
    photoRef: uuid.optional(), videoRef: uuid.optional(), ctaInterest,
  }),
  CERTIFICATION: z.strictObject({
    title, issuer: title.optional(), date: z.iso.date().optional(),
    description: description.optional(), evidenceMediaRefs: refs, verified: z.boolean(),
  }),
  BLOG_CATEGORY: category,
  POST: z.strictObject({
    title, excerpt: z.string().trim().min(1).max(300),
    blocks: z.array(blogBlock).max(100), coverRef: uuid.optional(),
    categoryRefs: refs, tags: z.array(z.string().trim().min(1).max(50)).max(10),
  }),
} satisfies Record<ContentKind, z.ZodType>;

export const slug = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const position = z.int().min(0).max(2147483647);
export const version = z.int().min(1).max(2147483646);
export const contentInput = z.strictObject({
  slug,
  position: position.default(0),
  payload: z.unknown(),
});

export type ValidatedPayload = {
  [K in ContentKind]: { kind: K; data: z.output<(typeof payloads)[K]> };
}[ContentKind];

export class EditorialError extends HttpException {
  constructor(
    readonly code: string,
    message: string,
    status: number,
    readonly fieldErrors?: Record<string, string>,
    readonly currentVersion?: number,
  ) {
    super(message, status);
  }
}

export function validationError(error: z.ZodError): EditorialError {
  const fieldErrors = Object.fromEntries(error.issues.map((issue) => [
    issue.path.map(String).join(".") || "payload",
    issue.code === "unrecognized_keys" ? "Campo no permitido." : "Valor inválido.",
  ]));
  return new EditorialError("VALIDATION_ERROR", "Revisa los datos enviados.", 422, fieldErrors);
}

export function parsePayload(kind: ContentKind, raw: unknown): ValidatedPayload {
  if (Buffer.byteLength(JSON.stringify(raw) ?? "") > 1024 * 1024) {
    throw new EditorialError("PAYLOAD_TOO_LARGE", "El contenido excede 1 MiB.", 413);
  }
  const result = payloads[kind].safeParse(raw);
  if (!result.success) throw validationError(result.error);
  return { kind, data: result.data } as ValidatedPayload;
}

export function assertPublishable(payload: ValidatedPayload, inherited: boolean): void {
  const invalid = (field: string, message: string) => {
    throw new EditorialError("VALIDATION_ERROR", "Completa los requisitos de publicación.", 422, { [field]: message });
  };
  switch (payload.kind) {
    case "SERVICE":
      if (!payload.data.imageRef && !inherited) invalid("imageRef", "Selecciona una imagen.");
      break;
    case "CERTIFICATION":
      if (!payload.data.verified || !payload.data.issuer) invalid("verified", "Confirma la acreditación e indica su organismo.");
      break;
    case "GALLERY":
      if (payload.data.orderedPhotoRefs.length === 0) invalid("orderedPhotoRefs", "Agrega al menos una fotografía.");
      break;
    case "POST":
      if (payload.data.blocks.length === 0) invalid("blocks", "Agrega al menos un bloque.");
      break;
  }
}
