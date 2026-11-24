import {
  Injectable, SetMetadata, type CanActivate, type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { AuthService, type Authenticated } from "./auth.service.js";

const PUBLIC = Symbol("public");
export const Public = () => SetMetadata(PUBLIC, true);
export type OwnerRequest = Request & { ownerSession: Authenticated };

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<OwnerRequest>();
    request.ownerSession = await this.auth.authenticate(request.get("Authorization"));
    return true;
  }
}
