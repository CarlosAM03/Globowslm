import {
  Body, Controller, Get, Header, Headers, HttpCode, Module, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import type { OwnerRequest } from "../auth/access.js";
import { AuthModule } from "../auth/auth.module.js";
import { AuthService } from "../auth/auth.service.js";
import { ContentKind, type ContentEntry } from "../generated/prisma/client.js";
import { contentInput, validationError, version } from "./dto.js";
import { EditorialModule, EditorialService, editorialState } from "./editorial.js";

const enabled: readonly ContentKind[] = [ContentKind.SITE, ContentKind.SERVICE, ContentKind.EVENT_TYPE, ContentKind.GALLERY, ContentKind.GALLERY_CATEGORY, ContentKind.TRAINING, ContentKind.CERTIFICATION, ContentKind.POST, ContentKind.BLOG_CATEGORY];
const transitions = {
  publish: "PUBLISH",
  withdraw: "WITHDRAW",
  archive: "ARCHIVE",
  restore: "RESTORE",
} as const;
const updateInput = contentInput.extend({ version });
const transitionInput = z.strictObject({ version });
const pageNumber = z.coerce.number().int().min(1).max(10000).default(1);
const revisionNumber = z.coerce.number().int().min(1).max(2147483647);
const publicationQuery = z.strictObject({
  page: pageNumber, kind: z.string().optional(), state: z.enum(["DRAFT", "PUBLISHED", "WITHDRAWN"]).optional(),
});

function number<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

function kindFor(value: string): ContentKind {
  const kind = value.toUpperCase() as ContentKind;
  if (!enabled.includes(kind)) throw new NotFoundException();
  return kind;
}

function formEntry(entry: ContentEntry) {
  return {
    id: entry.id, kind: entry.kind, slug: entry.slug, position: entry.position,
    version: entry.version, payload: entry.draftPayload, state: editorialState(entry),
    archived: entry.archivedAt !== null, updatedAt: entry.updatedAt.toISOString(),
  };
}

@ApiTags("publications")
@ApiBearerAuth("ownerSession")
@Controller("admin/publications")
class PublicationsController {
  constructor(private readonly cms: EditorialService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  async list(@Query() raw: unknown) {
    const parsed = publicationQuery.safeParse(raw);
    if (!parsed.success) throw validationError(parsed.error);
    const { page, kind, state } = parsed.data;
    const result = await this.cms.listPublications(kind ? [kindFor(kind)] : enabled, page, state);
    return { ...result, items: result.items.map((entry) => {
      const { payload, ...summary } = formEntry(entry);
      const data = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
      return { ...summary, title: String(data.title ?? data.brandName ?? entry.slug) };
    }) };
  }
}

@ApiTags("content")
@ApiBearerAuth("ownerSession")
@Controller("admin/content/:kind")
class ContentController {
  constructor(private readonly cms: EditorialService, private readonly auth: AuthService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  async list(@Param("kind") name: string, @Query("page") rawPage?: string) {
    const page = number(pageNumber, rawPage);
    const result = await this.cms.listDrafts(kindFor(name), page);
    return { items: result.items.map(formEntry), page, pageSize: result.pageSize, total: result.total };
  }

  @Post()
  async create(
    @Param("kind") name: string, @Body() body: unknown, @Req() req: OwnerRequest,
    @Headers("origin") origin: string | undefined, @Headers("x-csrf-token") csrf: string | undefined,
  ) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    return formEntry(await this.cms.create(kindFor(name), body, this.actor(req)));
  }

  @Get(":id")
  @Header("Cache-Control", "no-store")
  async read(@Param("kind") name: string, @Param("id", ParseUUIDPipe) id: string) {
    return formEntry(await this.cms.draft({ kind: kindFor(name), id }));
  }

  @Get(":id/preview")
  @Header("Cache-Control", "no-store")
  async preview(@Param("kind") name: string, @Param("id", ParseUUIDPipe) id: string) {
    return formEntry(await this.cms.draft({ kind: kindFor(name), id }));
  }

  @Get(":id/revisions")
  @Header("Cache-Control", "no-store")
  revisions(@Param("kind") kind: string, @Param("id", ParseUUIDPipe) id: string, @Query("page") page?: string) {
    return this.cms.revisions({ kind: kindFor(kind), id }, number(pageNumber, page));
  }

  @Get(":id/revisions/:number")
  @Header("Cache-Control", "no-store")
  revision(@Param("kind") kind: string, @Param("id", ParseUUIDPipe) id: string, @Param("number") revision: string) {
    return this.cms.revision({ kind: kindFor(kind), id }, number(revisionNumber, revision));
  }

  @Post(":id/revisions/:number/restore")
  @HttpCode(200)
  async restoreRevision(
    @Param("kind") kind: string, @Param("id", ParseUUIDPipe) id: string, @Param("number") revision: string,
    @Body() body: unknown, @Req() req: OwnerRequest, @Headers("origin") origin?: string, @Headers("x-csrf-token") csrf?: string,
  ) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    const update = transitionInput.safeParse(body);
    if (!update.success) throw validationError(update.error);
    return formEntry(await this.cms.restoreRevision({ kind: kindFor(kind), id }, update.data.version,
      number(revisionNumber, revision), this.actor(req)));
  }

  @Patch(":id")
  async edit(
    @Param("kind") name: string, @Param("id", ParseUUIDPipe) id: string, @Body() body: unknown,
    @Req() req: OwnerRequest, @Headers("origin") origin: string | undefined, @Headers("x-csrf-token") csrf: string | undefined,
  ) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    const update = updateInput.safeParse(body);
    if (!update.success) throw validationError(update.error);
    const { version: expected, ...draft } = update.data;
    return formEntry(await this.cms.edit({ kind: kindFor(name), id }, expected, draft, this.actor(req)));
  }

  @Post(":id/:action")
  @HttpCode(200)
  async transition(
    @Param("kind") name: string, @Param("id", ParseUUIDPipe) id: string, @Param("action") action: string,
    @Body() body: unknown,
    @Req() req: OwnerRequest, @Headers("origin") origin: string | undefined, @Headers("x-csrf-token") csrf: string | undefined,
  ) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    const update = transitionInput.safeParse(body);
    if (!update.success) throw validationError(update.error);
    if (!Object.hasOwn(transitions, action)) throw new NotFoundException();
    return formEntry(await this.cms.transition({
      kind: kindFor(name), id,
    }, update.data.version, transitions[action as keyof typeof transitions], this.actor(req)));
  }

  private actor(req: OwnerRequest) {
    return { actorId: req.ownerSession.owner.id, requestId: String(req.res?.locals.requestId) };
  }
}

@Module({ imports: [EditorialModule, AuthModule], controllers: [ContentController, PublicationsController] })
export class ContentAdminModule {}
