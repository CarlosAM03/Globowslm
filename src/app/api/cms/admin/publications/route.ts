import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCmsConfig, ownerCookie, requestCms, tokenPattern } from "@/lib/cms/auth-server";
import { enabledContent, type ContentKind } from "@/lib/cms/content-path";
import { publicationStates, type PublicationState } from "@/types/cms/publications";

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const headers = { "Cache-Control": "no-store", "X-Request-Id": requestId };
  const failed = (status: number, message: string) => NextResponse.json({ message, requestId }, { headers, status });

  const token = request.cookies.get(ownerCookie)?.value;
  if (!token || !tokenPattern.test(token)) return failed(401, "Inicia sesión para continuar.");
  const query = request.nextUrl.searchParams;
  const page = query.get("page");
  const kind = query.get("kind");
  const state = query.get("state");

  if ([...query.keys()].some((key) => !["page", "kind", "state"].includes(key) || query.getAll(key).length !== 1) ||
      (page !== null && (!/^[1-9]\d{0,4}$/.test(page) || Number(page) > 10_000)) ||
      (kind !== null && !enabledContent.some((value) => value === kind)) ||
      (state !== null && !publicationStates.some((value) => value === state))) {
    return failed(400, "Filtros inválidos.");
  }

  try {
    const response = await requestCms(getCmsConfig(), "admin/publications", {
      method: "GET", requestId, token, page: page === null ? undefined : Number(page),
      kind: kind === null ? undefined : kind as ContentKind,
      state: state === null ? undefined : state as PublicationState,
    });
    if (response.status === 401) return failed(401, "Inicia sesión para continuar.");
    if (response.ok) return NextResponse.json(await response.json(), { headers });
  } catch {
    return failed(503, "No se pudo cargar el centro de publicaciones.");
  }
  return failed(503, "No se pudo cargar el centro de publicaciones.");
}
