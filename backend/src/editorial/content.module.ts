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

const enabled: readonly ContentKind[] = [ContentKind.SITE];
const updateInput = contentInput.extend({ version });
const transitionInput = z.strictObject({ version });

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

@ApiTags("content")
@ApiBearerAuth("ownerSession")
@Controller("admin/content/:kind")
class ContentController {
  constructor(private readonly cms: EditorialService, private readonly auth: AuthService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  async list(@Param("kind") name: string, @Query("page") rawPage?: string) {
    const page = z.coerce.number().int().min(1).max(10000).default(1).safeParse(rawPage);
    if (!page.success) throw validationError(page.error);
    const result = await this.cms.listDrafts(kindFor(name), page.data);
    return { items: result.items.map(formEntry), page: page.data, pageSize: result.pageSize, total: result.total };
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

  @Post(":id/publish")
  @HttpCode(200)
  async publish(
    @Param("kind") name: string, @Param("id", ParseUUIDPipe) id: string, @Body() body: unknown,
    @Req() req: OwnerRequest, @Headers("origin") origin: string | undefined, @Headers("x-csrf-token") csrf: string | undefined,
  ) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    const update = transitionInput.safeParse(body);
    if (!update.success) throw validationError(update.error);
    return formEntry(await this.cms.transition({ kind: kindFor(name), id }, update.data.version, "PUBLISH", this.actor(req)));
  }

  private actor(req: OwnerRequest) {
    return { actorId: req.ownerSession.owner.id, requestId: String(req.res?.locals.requestId) };
  }
}

@Module({ imports: [EditorialModule, AuthModule], controllers: [ContentController] })
export class ContentAdminModule {}
