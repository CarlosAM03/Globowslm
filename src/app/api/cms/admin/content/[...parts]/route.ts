import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCmsConfig, isRecord, ownerCookie, requestCms, tokenPattern } from "@/lib/cms/auth-server";
import { BodyError, readBody } from "@/lib/cms/cms-json";
import { resolveContentPath } from "@/lib/cms/content-path";

const responses: Record<number, [string, string]> = {
  400: ["BAD_REQUEST", "Solicitud inválida."],
  401: ["UNAUTHORIZED", "Inicia sesión para continuar."],
  403: ["FORBIDDEN", "La solicitud no está autorizada."],
  404: ["NOT_FOUND", "Contenido no encontrado."],
  409: ["CONFLICT", "El contenido cambió. Recarga e intenta de nuevo."],
  413: ["PAYLOAD_TOO_LARGE", "La solicitud excede el tamaño permitido."],
  422: ["VALIDATION_ERROR", "Revisa los datos enviados."],
  503: ["UNAVAILABLE", "El servicio editorial no está disponible."],
};

async function handle(request: NextRequest, context: RouteContext<"/api/cms/admin/content/[...parts]">) {
  const requestId = randomUUID();
  const headers = { "Cache-Control": "no-store", "X-Request-Id": requestId };
  const fail = (raw: number, details?: unknown) => {
    const status = Object.hasOwn(responses, raw) ? raw : 503;
    const [code, message] = responses[status];
    const info = isRecord(details) ? details : {};
    const fields = isRecord(info.fieldErrors)
      ? Object.fromEntries(Object.entries(info.fieldErrors).filter(([, value]) => typeof value === "string"))
      : undefined;
    return NextResponse.json({
      code: status === 409 && info.code === "VERSION_CONFLICT" ? "VERSION_CONFLICT" : code,
      message: status === 409 && typeof info.message === "string" ? info.message : message,
      requestId,
      ...(fields && { fieldErrors: fields }),
      ...(status === 409 && typeof info.currentVersion === "number" && { currentVersion: info.currentVersion }),
    }, { status, headers });
  };

  const { parts } = await context.params;
  const endpoint = resolveContentPath(parts, request.method);
  if (!endpoint) return fail(404);
  const token = request.cookies.get(ownerCookie)?.value;
  if (!token || !tokenPattern.test(token)) return fail(401);

  try {
    const config = getCmsConfig();
    const method = request.method as "GET" | "POST" | "PATCH";
    const mutates = method !== "GET";
    const csrf = request.headers.get("X-Csrf-Token") ?? undefined;
    if (mutates && (request.headers.get("Origin") !== config.appOrigin || !csrf || !tokenPattern.test(csrf))) return fail(403);
    let page: number | undefined;
    const query = request.nextUrl.searchParams;
    if (query.size) {
      const raw = query.get("page");
      if (method !== "GET" || parts.length !== 1 || query.size !== 1 || !raw || !/^[1-9]\d{0,4}$/.test(raw) || Number(raw) > 10_000) {
        return fail(400);
      }
      page = Number(raw);
    }
    const body = mutates ? await readBody(request) : undefined;
    const upstream = await requestCms(config, endpoint, { method, requestId, token, csrf, body, page });
    if (!upstream.ok) return fail(upstream.status, await upstream.json());
    return NextResponse.json(await upstream.json(), { status: upstream.status, headers });
  } catch (error) {
    return fail(error instanceof BodyError ? error.status : 503);
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
