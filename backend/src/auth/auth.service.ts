import { timingSafeEqual } from "node:crypto";
import { BadRequestException, ForbiddenException, HttpException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { z } from "zod";
import { API_CONFIG, type ApiConfig } from "../config.js";
import { DatabaseService } from "../database.js";
import { lockAccountChanges, passwordUsedByOtherAccount } from "./account-passwords.js";
import { csrfFor, email, hashPassword, hashToken, matchesHash, newPasswordInput, newToken, passwordInput, tokenPattern, verifyPassword, type AccountRole } from "./credentials.js";

const MINUTE = 60_000;
const SESSION_LENGTH = 8 * 60 * MINUTE;
const SESSION_IDLE = 30 * MINUTE;
const CHALLENGE_LENGTH = 5 * MINUTE;
export const loginSchema = z.strictObject({
  email,
  password: passwordInput,
});
export const changePasswordSchema = z.strictObject({ currentPassword: passwordInput, newPassword: newPasswordInput });

export type OwnerIdentity = { id: string; email: string; role: AccountRole };
export type Authenticated = { sessionId: string; owner: OwnerIdentity; csrfHash: string; csrfToken: string };

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService, @Inject(API_CONFIG) private readonly config: ApiConfig) {}

  private assertOrigin(origin: string | undefined) {
    if (origin !== this.config.appOrigin) throw new ForbiddenException();
  }

  assertBff(header: string | undefined) {
    const secret = this.config.bffSecret;
    if (!secret) return;
    if (!header || !/^[A-Za-z0-9_-]{43,86}$/.test(header) || header.length !== secret.length ||
        !timingSafeEqual(Buffer.from(header), Buffer.from(secret))) throw new ForbiddenException();
  }

  async challenge(origin: string | undefined, ip: string) {
    this.assertOrigin(origin);
    const now = new Date();
    await this.rateLimit(`challenge:${ip}`, now, 40);
    const csrfToken = newToken();
    await this.db.$transaction([
      this.db.loginChallenge.deleteMany({ where: { expiresAt: { lte: now } } }),
      this.db.rateLimitBucket.deleteMany({ where: { resetAt: { lte: now } } }),
      this.db.loginChallenge.create({
        data: { tokenHash: hashToken(csrfToken), expiresAt: new Date(now.valueOf() + CHALLENGE_LENGTH) },
      }),
    ]);
    return { csrfToken };
  }

  async login(input: unknown, origin: string | undefined, csrfToken: string | undefined, ip: string) {
    this.assertOrigin(origin);
    if (!csrfToken || !tokenPattern.test(csrfToken)) throw new ForbiddenException();
    const now = new Date();
    const consumed = await this.db.loginChallenge.updateMany({
      where: { tokenHash: hashToken(csrfToken), usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (consumed.count !== 1) throw new ForbiddenException();

    const body = loginSchema.safeParse(input);
    if (!body.success) throw new BadRequestException();
    await this.rateLimit(`login:ip:${ip}`, now, 30);
    await this.rateLimit(`login:identity:${ip}:${body.data.email}`, now, 5);

    const owner = await this.db.owner.findUnique({ where: { emailNormalized: body.data.email } });
    const valid = await verifyPassword(body.data.password, owner?.active ? owner.passwordHash : undefined);
    if (!owner || !valid) throw new UnauthorizedException();

    const sessionToken = newToken();
    const csrf = csrfFor(sessionToken);
    await this.db.$transaction(async (tx) => {
      // Lock the provisioned account. A password rotation either precedes login or revokes the resulting session.
      const stillCurrent = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "owners"
        WHERE "id" = ${owner.id}::uuid AND "active" = TRUE AND "passwordHash" = ${owner.passwordHash}
        FOR UPDATE
      `;
      if (stillCurrent.length !== 1) throw new UnauthorizedException();
      await tx.session.create({ data: {
        ownerId: owner.id,
        tokenHash: hashToken(sessionToken),
        csrfHash: hashToken(csrf),
        expiresAt: new Date(now.valueOf() + SESSION_LENGTH),
      } });
    });
    return { sessionToken, csrfToken: csrf, owner: this.identity(owner) };
  }

  async authenticate(header: string | undefined): Promise<Authenticated> {
    const token = header?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!token) throw new UnauthorizedException();
    const session = await this.db.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { owner: { select: { id: true, emailNormalized: true, active: true, role: true } } },
    });
    const now = new Date();
    if (!session || session.revokedAt || !session.owner.active) throw new UnauthorizedException();
    const touched = await this.db.session.updateMany({
      where: {
        id: session.id, revokedAt: null, expiresAt: { gt: now },
        lastSeenAt: { gt: new Date(now.valueOf() - SESSION_IDLE) },
        owner: { active: true },
      },
      data: { lastSeenAt: now },
    });
    if (touched.count !== 1) throw new UnauthorizedException();
    return {
      sessionId: session.id,
      owner: this.identity(session.owner),
      csrfHash: session.csrfHash,
      csrfToken: csrfFor(token),
    };
  }

  assertMutation(session: Authenticated, origin: string | undefined, csrfToken: string | undefined) {
    this.assertOrigin(origin);
    if (!matchesHash(csrfToken, session.csrfHash)) throw new ForbiddenException();
  }

  async logout(session: Authenticated, origin: string | undefined, csrfToken: string | undefined) {
    this.assertMutation(session, origin, csrfToken);
    await this.db.session.updateMany({
      where: { id: session.sessionId, revokedAt: null }, data: { revokedAt: new Date() },
    });
    return { signedOut: true };
  }

  async changePassword(
    session: Authenticated, input: unknown, origin: string | undefined, csrfToken: string | undefined, requestId: string,
  ) {
    this.assertMutation(session, origin, csrfToken);
    const body = changePasswordSchema.safeParse(input);
    if (!body.success || body.data.currentPassword === body.data.newPassword) throw new BadRequestException();
    await this.rateLimit(`password:${session.owner.id}`, new Date(), 5);
    await this.db.$transaction(async (tx) => {
      await lockAccountChanges(tx);
      const account = await tx.owner.findUnique({ where: { id: session.owner.id } });
      const liveSession = await tx.session.findFirst({ where: {
        id: session.sessionId, ownerId: session.owner.id, revokedAt: null, expiresAt: { gt: new Date() },
      }, select: { id: true } });
      if (!account?.active || !liveSession ||
          !await verifyPassword(body.data.currentPassword, account.passwordHash)) throw new UnauthorizedException();
      if (await passwordUsedByOtherAccount(tx, account.role, body.data.newPassword)) throw new BadRequestException();
      const passwordHash = await hashPassword(body.data.newPassword);
      await tx.owner.update({ where: { id: account.id }, data: { passwordHash } });
      await tx.session.updateMany({ where: { ownerId: account.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditEvent.create({ data: {
        actorId: account.id, action: "PASSWORD_CHANGED", entityId: account.id, entityType: "ACCOUNT",
        requestId, changedFields: [], outcome: "SUCCESS",
      } });
    });
    return { passwordChanged: true };
  }

  private identity(account: { id: string; emailNormalized: string; role: AccountRole }): OwnerIdentity {
    return { id: account.id, email: account.emailNormalized, role: account.role };
  }

  private async rateLimit(scope: string, now: Date, limit: number) {
    const resetAt = new Date(now.valueOf() + 15 * MINUTE);
    const key = hashToken(scope);
    const rows = await this.db.$queryRaw<{ count: number }[]>`
      INSERT INTO "rate_limit_buckets" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE
      SET "count" = CASE WHEN "rate_limit_buckets"."resetAt" <= ${now}
        THEN 1 ELSE LEAST("rate_limit_buckets"."count" + 1, ${limit + 1}) END,
      "resetAt" = CASE WHEN "rate_limit_buckets"."resetAt" <= ${now}
        THEN ${resetAt} ELSE "rate_limit_buckets"."resetAt" END
      RETURNING "count"
    `;
    if (rows[0].count > limit) throw new HttpException("Rate limit", 429);
  }
}
