import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCmsConfig, isRecord, ownerCookie, requestCms, tokenPattern } from "@/lib/cms/auth-server";

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const headers = { "Cache-Control": "no-store", "X-Request-Id": requestId };
  const fail = (status: number) => NextResponse.json({ requestId }, { status, headers });
  const token = request.cookies.get(ownerCookie)?.value;
  if (!token || !tokenPattern.test(token)) return fail(401);
  try {
    const response = await requestCms(getCmsConfig(), "admin/diagnostics", { method: "GET", requestId, token });
    if (response.status === 401 || response.status === 403) return fail(response.status);
    if (response.ok) {
      const data: unknown = await response.json();
      if (isRecord(data) && [data.database, data.storage].every((value) => value === "ok" || value === "unavailable")) {
        const audit = Array.isArray(data.audit) ? data.audit.slice(0, 25).filter(isRecord).map((row) => ({
          actorId: row.actorId, action: row.action, entityType: row.entityType,
          requestId: row.requestId, at: row.at, outcome: row.outcome,
        })) : null;
        if (audit?.some((row) => Object.values(row).some((value) => typeof value !== "string"))) return fail(503);
        return NextResponse.json({ database: data.database, storage: data.storage, audit }, { headers });
      }
    }
  } catch {
    return fail(503);
  }
  return fail(503);
}
