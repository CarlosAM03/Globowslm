import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { BodyError, readBody } from "@/lib/cms/cms-json";
import { resolveAuthAction } from "@/lib/cms/auth-path";
import {
  getCmsConfig, isRecord, loginCookie, ownerCookie, parseSession, requestAuth, tokenPattern,
} from "@/lib/cms/auth-server";

const errors: Record<number, [string, string]> = {
  400: ["BAD_REQUEST", "Revisa los datos enviados."],
  401: ["UNAUTHORIZED", "Revisa tu correo y contraseña o vuelve a iniciar sesión."],
  403: ["FORBIDDEN", "La solicitud no está autorizada."],
  404: ["NOT_FOUND", "Recurso no encontrado."],
  413: ["PAYLOAD_TOO_LARGE", "La solicitud excede el tamaño permitido."],
  429: ["RATE_LIMITED", "Demasiados intentos. Espera antes de volver a intentar."],
  503: ["UNAVAILABLE", "El servicio no está disponible. Intenta de nuevo."],
};

function respond(payload: object, status: number, id: string) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store", "X-Request-Id": id },
  });
}

function failure(status: number, id: string) {
  const safe = Object.hasOwn(errors, status) ? status : 503;
  const [code, message] = errors[safe];
  return respond({ code, message, requestId: id }, safe, id);
}

function matchesToken(left: string | undefined, right: string | undefined) {
  return !!left && !!right && tokenPattern.test(left) && tokenPattern.test(right) &&
    timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

async function handle(request: NextRequest, context: RouteContext<"/api/cms/[...action]">) {
  const id = randomUUID();
  const { action: parts } = await context.params;
  const action = resolveAuthAction(parts, request.method);
  if (!action) return failure(404, id);
  try {
    const config = getCmsConfig();
    const method = request.method === "POST" ? "POST" : "GET";
    const csrf = request.headers.get("X-Csrf-Token") ?? undefined;
    const cookieOpts = { httpOnly: true, secure: config.secure, sameSite: "lax" as const, path: "/" };
    if (method === "POST" && request.headers.get("Origin") !== config.appOrigin) return failure(403, id);
    if (action === "csrf" && request.headers.get("Sec-Fetch-Site") === "cross-site") return failure(403, id);
    if (action === "login" && !matchesToken(csrf, request.cookies.get(loginCookie)?.value)) return failure(403, id);

    const token = request.cookies.get(ownerCookie)?.value;
    const sessionRequired = action === "session" || action === "logout" || action === "password";
    if (sessionRequired && (!token || !tokenPattern.test(token))) return failure(401, id);
    if (sessionRequired && method === "POST" && (!csrf || !tokenPattern.test(csrf))) return failure(403, id);
    const body = action === "login" || action === "password" ? await readBody(request) : undefined;
    const upstream = await requestAuth(config, action, {
      method, requestId: id, csrf, body,
      token: sessionRequired ? token : undefined,
    });
    if (!upstream.ok) {
      const rejection = failure(upstream.status, id);
      if (action === "login") rejection.cookies.set(loginCookie, "", { ...cookieOpts, maxAge: 0 });
      if (action === "logout" && upstream.status === 401) rejection.cookies.set(ownerCookie, "", { ...cookieOpts, maxAge: 0 });
      return rejection;
    }

    const value: unknown = await upstream.json();
    if (!isRecord(value)) return failure(503, id);
    if (action === "csrf") {
      if (typeof value.csrfToken !== "string" || !tokenPattern.test(value.csrfToken)) return failure(503, id);
      const reply = respond({ csrfToken: value.csrfToken }, 200, id);
      reply.cookies.set(loginCookie, value.csrfToken, { ...cookieOpts, maxAge: 300 });
      return reply;
    }
    if (action === "logout") {
      if (value.signedOut !== true) return failure(503, id);
      const reply = respond({ signedOut: true }, 200, id);
      reply.cookies.set(ownerCookie, "", { ...cookieOpts, maxAge: 0 });
      return reply;
    }
    if (action === "password") {
      if (value.passwordChanged !== true) return failure(503, id);
      const reply = respond({ passwordChanged: true }, 200, id);
      reply.cookies.set(ownerCookie, "", { ...cookieOpts, maxAge: 0 });
      return reply;
    }
    const session = parseSession(value);
    if (!session) return failure(503, id);
    const reply = respond(session, 200, id);
    if (action === "login") {
      if (typeof value.sessionToken !== "string" || !tokenPattern.test(value.sessionToken)) return failure(503, id);
      reply.cookies.set(ownerCookie, value.sessionToken, { ...cookieOpts, maxAge: 8 * 60 * 60 });
      reply.cookies.set(loginCookie, "", { ...cookieOpts, maxAge: 0 });
    }
    return reply;
  } catch (error) {
    return failure(error instanceof BodyError ? error.status : 503, id);
  }
}

export const GET = handle;
export const POST = handle;
