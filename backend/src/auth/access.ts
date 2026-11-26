import {
  ForbiddenException, Injectable, SetMetadata, type CanActivate, type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { AuthService, type Authenticated } from "./auth.service.js";

const PUBLIC = Symbol("public");
const ADMIN_ONLY = Symbol("adminOnly");
export const Public = () => SetMetadata(PUBLIC, true);
export const AdminOnly = () => SetMetadata(ADMIN_ONLY, true);
export type OwnerRequest = Request & { ownerSession: Authenticated };

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC, targets)) return true;
    const request = context.switchToHttp().getRequest<OwnerRequest>();
    request.ownerSession = await this.auth.authenticate(request.get("Authorization"));
    if (this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY, targets) && request.ownerSession.owner.role !== "ADMIN") {
      throw new ForbiddenException();
    }
    return true;
  }
}
