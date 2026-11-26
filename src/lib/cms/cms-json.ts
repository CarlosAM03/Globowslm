import type { NextRequest } from "next/server";
import { isRecord } from "./auth-server";

export class BodyError extends Error {
  constructor(readonly status: number) { super("Solicitud inválida"); }
}

export async function readBody(request: NextRequest): Promise<string> {
  if (request.headers.get("content-type")?.split(";")[0].toLowerCase() !== "application/json" || !request.body) {
    throw new BodyError(400);
  }
  const max = 1024 * 1024;
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let length = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > max) {
        await reader.cancel();
        throw new BodyError(413);
      }
      text += decoder.decode(value, { stream: true });
    }
    const value: unknown = JSON.parse(text + decoder.decode());
    if (!isRecord(value)) throw new BodyError(400);
    return JSON.stringify(value);
  } catch (error) {
    if (error instanceof BodyError) throw error;
    throw new BodyError(400);
  } finally {
    reader.releaseLock();
  }
}
