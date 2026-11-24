import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCmsConfig, isRecord, ownerCookie, requestCms, tokenPattern } from "@/lib/cms/auth-server";

function readTotals(value: unknown) {
  if (!isRecord(value)) return null;
  const { draft, published, withdrawn } = value;
  if (typeof draft !== "number" || typeof published !== "number" || typeof withdrawn !== "number" ||
      ![draft, published, withdrawn].every((count) => Number.isSafeInteger(count) && count >= 0)) return null;
  return { draft, published, withdrawn };
}

function dashboardPayload(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.byKind) || !Array.isArray(value.recent)) return null;
  const totals = readTotals(value.totals);
  if (!totals) return null;
  const byKind = [];
  for (const row of value.byKind) {
    const count = readTotals(row);
    if (!count || !isRecord(row) || typeof row.kind !== "string") return null;
    byKind.push({ kind: row.kind, ...count });
  }
  const recent = [];
  for (const row of value.recent) {
    if (!isRecord(row)) return null;
    const { id, action, entityType, entityId, at } = row;
    if (typeof id !== "string" || typeof action !== "string" || typeof entityType !== "string" ||
        typeof entityId !== "string" || typeof at !== "string" || !Number.isFinite(Date.parse(at))) return null;
    recent.push({ id, action, entityType, entityId, at });
  }
  return { totals, byKind, recent };
}

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const headers = { "Cache-Control": "no-store", "X-Request-Id": requestId };
  const token = request.cookies.get(ownerCookie)?.value;
  const unauthorized = () => NextResponse.json({ code: "UNAUTHORIZED", message: "Inicia sesión para continuar.", requestId }, { status: 401, headers });
  if (!token || !tokenPattern.test(token)) return unauthorized();

  try {
    const upstream = await requestCms(getCmsConfig(), "admin/dashboard", { method: "GET", requestId, token });
    if (upstream.status === 401) return unauthorized();
    if (upstream.ok) {
      const payload = dashboardPayload(await upstream.json());
      if (payload) return NextResponse.json(payload, { headers });
    }
  } catch {
    // Upstream errors are returned as a controlled unavailable state.
  }
  return NextResponse.json({ code: "UNAVAILABLE", message: "No se pudo cargar el resumen.", requestId }, { status: 503, headers });
}
