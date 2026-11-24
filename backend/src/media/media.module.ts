import {
  Body, Controller, Delete, Get, Header, Headers, HttpCode, Module, NotFoundException, Param,
  ParseUUIDPipe, Patch, Post, Query, Req, Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AuthModule } from "../auth/auth.module.js";
import { AuthService } from "../auth/auth.service.js";
import { Public, type OwnerRequest } from "../auth/access.js";
import { DatabaseModule } from "../database.js";
import { validationError, version } from "../editorial/dto.js";
import { StorageModule } from "../storage.js";
import { MediaService } from "./media.service.js";

const ticket = z.strictObject({ mime: z.string().max(80), size: z.int().positive(), filename: z.string().trim().min(1).max(180) });
const edit = z.strictObject({
  version, title: z.string().trim().max(160), alt: z.string().trim().max(300), retire: z.boolean().optional(),
});
const remove = z.strictObject({ version });
const list = z.strictObject({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  type: z.enum(["image", "video"]).optional(),
});

function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw validationError(result.error);
  return result.data;
}

@ApiTags("admin media")
@ApiBearerAuth("ownerSession")
@Controller("admin/media")
class AdminMediaController {
  constructor(private readonly media: MediaService, private readonly auth: AuthService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  list(@Query() input: unknown) {
    const parsed = validate(list, input);
    return this.media.list(parsed.page, parsed.type);
  }

  @Post("upload-ticket")
  @Header("Cache-Control", "no-store")
  issue(@Req() req: OwnerRequest, @Body() input: unknown, @Headers("origin") origin?: string, @Headers("x-csrf-token") csrf?: string) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    const { mime, size, filename } = validate(ticket, input);
    return this.media.uploadTicket(req.ownerSession, mime, size, filename);
  }

  @Get(":id")
  @Header("Cache-Control", "no-store")
  get(@Param("id", ParseUUIDPipe) id: string) {
    return this.media.get(id);
  }

  @Post(":id/preview-ticket")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  preview(@Req() req: OwnerRequest, @Param("id", ParseUUIDPipe) id: string, @Headers("origin") origin?: string, @Headers("x-csrf-token") csrf?: string) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    return this.media.previewTicket(req.ownerSession, id);
  }

  @Patch(":id")
  patch(@Req() req: OwnerRequest, @Param("id", ParseUUIDPipe) id: string, @Body() input: unknown, @Headers("origin") origin?: string, @Headers("x-csrf-token") csrf?: string) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    return this.media.update(id, validate(edit, input), req.ownerSession.owner.id, String(req.res?.locals.requestId));
  }

  @Delete(":id")
  delete(@Req() req: OwnerRequest, @Param("id", ParseUUIDPipe) id: string, @Body() input: unknown, @Headers("origin") origin?: string, @Headers("x-csrf-token") csrf?: string) {
    this.auth.assertMutation(req.ownerSession, origin, csrf);
    return this.media.remove(id, validate(remove, input).version, req.ownerSession.owner.id, String(req.res?.locals.requestId));
  }
}

@ApiTags("media")
@Public()
@Controller("media")
class DirectMediaController {
  constructor(private readonly media: MediaService) {}

  @Post("upload")
  @Header("Cache-Control", "no-store")
  save(@Req() req: Request) {
    return this.media.upload(req, String(req.res?.locals.requestId));
  }

  @Get("public/:id")
  async publicAsset(@Param("id", ParseUUIDPipe) id: string, @Query("width") width: unknown, @Req() req: Request, @Res() res: Response) {
    if (width !== undefined && !["320", "480", "640", "828", "1080", "1280"].some((value) => value === width)) {
      throw new NotFoundException();
    }
    return this.media.send(await this.media.publicAsset(id), req, res, width === undefined ? undefined : Number(width));
  }

  @Get("preview/:id")
  @Header("Referrer-Policy", "no-referrer")
  @Header("Cache-Control", "no-store")
  async preview(
    @Param("id", ParseUUIDPipe) id: string, @Query("ticket") token: string | undefined,
    @Req() req: Request, @Res() res: Response,
  ) {
    return this.media.send(await this.media.previewAsset(id, token), req, res);
  }
}

export function mediaCors(origin: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = req.path === "/api/v1/media/upload";
    const asset = /^\/api\/v1\/media\/(?:public|preview)\/[0-9a-f-]{36}$/i.test(req.path);
    if (!upload && !asset) {
      next();
      return;
    }
    res.vary("Origin");
    const allowed = req.get("Origin") === origin;
    if (allowed) res.set("Access-Control-Allow-Origin", origin);
    if (req.method === "OPTIONS") {
      if (!allowed) {
        res.status(403).end();
        return;
      }
      res.set({
        "Access-Control-Allow-Methods": upload ? "POST" : "GET, HEAD",
        "Access-Control-Allow-Headers": upload ? "Authorization, Content-Type" : "Range",
      });
      res.status(204).end();
      return;
    }
    next();
  };
}

@Module({
  imports: [DatabaseModule, StorageModule, AuthModule],
  controllers: [AdminMediaController, DirectMediaController],
  providers: [MediaService],
})
export class MediaModule {}
