import { Body, Controller, Get, Header, Headers, HttpCode, Module, Post, Req, Res } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { DatabaseModule } from "../database.js";
import { OwnerGuard, Public, type OwnerRequest } from "./access.js";
import { AuthService } from "./auth.service.js";

@ApiTags("auth")
@Controller("auth")
class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get("csrf")
  @Header("Cache-Control", "no-store")
  @ApiOperation({ summary: "Emite un desafío de acceso de un solo uso para el BFF." })
  challenge(@Headers("origin") origin: string | undefined, @Headers("x-cms-bff") bff: string | undefined, @Req() req: Request) {
    this.auth.assertBff(bff);
    return this.auth.challenge(origin, req.socket.remoteAddress ?? "unknown");
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  @ApiOperation({ summary: "Autentica a OWNER o ADMIN. La respuesta de sesión se consume dentro del BFF." })
  login(
    @Body() body: unknown,
    @Headers("origin") origin: string | undefined,
    @Headers("x-csrf-token") csrf: string | undefined,
    @Headers("x-cms-bff") bff: string | undefined,
    @Req() req: Request,
  ) {
    this.auth.assertBff(bff);
    return this.auth.login(body, origin, csrf, req.socket.remoteAddress ?? "unknown");
  }

  @Get("session")
  @ApiBearerAuth("ownerSession")
  @Header("Cache-Control", "no-store")
  session(@Req() req: OwnerRequest) {
    const { owner, csrfToken } = req.ownerSession;
    return { owner, csrfToken };
  }

  @Post("logout")
  @HttpCode(200)
  @ApiBearerAuth("ownerSession")
  @Header("Cache-Control", "no-store")
  logout(
    @Req() req: OwnerRequest,
    @Headers("origin") origin: string | undefined,
    @Headers("x-csrf-token") csrf: string | undefined,
  ) {
    return this.auth.logout(req.ownerSession, origin, csrf);
  }

  @Post("password")
  @HttpCode(200)
  @ApiBearerAuth("ownerSession")
  @Header("Cache-Control", "no-store")
  @ApiOperation({ summary: "Cambia la contraseña de la cuenta autenticada y revoca sus sesiones." })
  password(
    @Req() req: OwnerRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: unknown,
    @Headers("origin") origin: string | undefined,
    @Headers("x-csrf-token") csrf: string | undefined,
  ) {
    return this.auth.changePassword(req.ownerSession, body, origin, csrf, res.locals.requestId as string);
  }
}

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: OwnerGuard }],
  exports: [AuthService],
})
export class AuthModule {}
