import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCmsConfig, isRecord, ownerCookie, requestCms, tokenPattern } from "@/lib/cms/auth-server";
import { BodyError, readBody } from "@/lib/cms/cms-json";
import { parseMediaOrigin } from "@/lib/cms/media-origin";
import { resolveMediaPath } from "@/lib/cms/media-path";

const labels: Record<number, [string, string]> = {
  400: ["BAD_REQUEST", "Solicitud inválida."],
  401: ["UNAUTHORIZED", "Inicia sesión para continuar."],
  403: ["FORBIDDEN", "La solicitud no está autorizada."],
  404: ["NOT_FOUND", "Archivo no encontrado."],
  409: ["CONFLICT", "El archivo está en uso o cambió. Actualiza la biblioteca."],
  413: ["PAYLOAD_TOO_LARGE", "El archivo excede el tamaño permitido."],
  415: ["UNSUPPORTED_MEDIA_TYPE", "El tipo de archivo no se admite."],
  422: ["VALIDATION_ERROR", "Revisa los datos del archivo."],
  503: ["UNAVAILABLE", "No se pudo conectar con la biblioteca."],
};

async function handle(request: NextRequest, context: RouteContext<"/api/cms/admin/media/[[...parts]]">) {
  const requestId = randomUUID();
  const headers = { "Cache-Control": "no-store", "X-Request-Id": requestId };
  const fail = (code: number) => {
    const status = Object.hasOwn(labels, code) ? code : 503;
    const [name, message] = labels[status];
    return NextResponse.json({ code: name, message, requestId }, { status, headers });
  };
  const { parts = [] } = await context.params;
  const endpoint = resolveMediaPath(parts, request.method);
  if (!endpoint) return fail(404);
  const token = request.cookies.get(ownerCookie)?.value;
  if (!token || !tokenPattern.test(token)) return fail(401);

  try {
    const config = getCmsConfig();
    const method = request.method as "GET" | "POST" | "PATCH" | "DELETE";
    const csrf = request.headers.get("X-Csrf-Token") ?? undefined;
    if (method !== "GET" && (request.headers.get("Origin") !== config.appOrigin || !csrf || !tokenPattern.test(csrf))) return fail(403);

    const query = request.nextUrl.searchParams;
    const page = query.get("page");
    const type = query.get("type");
    if (query.size && (endpoint !== "admin/media" ||
        [...query.keys()].some((key) => key !== "page" && key !== "type") ||
        query.getAll("page").length > 1 || query.getAll("type").length > 1 ||
        (page !== null && (!/^[1-9]\d{0,4}$/.test(page) || Number(page) > 10_000)) ||
        (type !== null && type !== "image" && type !== "video"))) return fail(400);

    const issuing = endpoint === "admin/media/upload-ticket" || endpoint.endsWith("/preview-ticket");
    const mediaOrigin = issuing ? parseMediaOrigin(process.env.CMS_MEDIA_ORIGIN ?? "", config.appOrigin) : undefined;
    const body = method !== "GET" ? await readBody(request) : undefined;
    const upstream = await requestCms(config, endpoint, {
      method, requestId, token, csrf, body,
      page: page === null ? undefined : Number(page),
      mediaType: type === "image" || type === "video" ? type : undefined,
    });
    if (!upstream.ok) return fail(upstream.status);
    const value: unknown = await upstream.json();
    if (mediaOrigin) {
      if (!isRecord(value) || typeof value.token !== "string" || !tokenPattern.test(value.token) ||
          typeof value.expiresAt !== "string") return fail(503);
      if (endpoint === "admin/media/upload-ticket") {
        return NextResponse.json({
          token: value.token, expiresAt: value.expiresAt, url: `${mediaOrigin}/api/v1/media/upload`,
        }, { status: upstream.status, headers });
      }
      const preview = new URL(`/api/v1/media/preview/${parts[0]}`, mediaOrigin);
      preview.searchParams.set("ticket", value.token);
      return NextResponse.json({ url: preview.href, expiresAt: value.expiresAt }, { status: upstream.status, headers });
    }
    return NextResponse.json(value, { status: upstream.status, headers });
  } catch (error) {
    return fail(error instanceof BodyError ? error.status : 503);
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
