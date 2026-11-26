import { randomUUID } from "node:crypto";
import {
  Catch, HttpException,
  type ArgumentsHost, type ExceptionFilter,
} from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";

import { EditorialError } from "./editorial/dto.js";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export class ApiError {
  @ApiProperty({ example: "NOT_FOUND" })
  code!: string;

  @ApiProperty({ example: "Recurso no encontrado." })
  message!: string;

  @ApiProperty({ format: "uuid" })
  requestId!: string;
}

const publicErrors: Record<number, [string, string]> = {
  400: ["BAD_REQUEST", "Solicitud inválida."],
  401: ["UNAUTHORIZED", "Inicia sesión para continuar."],
  403: ["FORBIDDEN", "Acceso denegado."],
  404: ["NOT_FOUND", "Recurso no encontrado."],
  409: ["CONFLICT", "El estado cambió. Actualiza e intenta de nuevo."],
  413: ["PAYLOAD_TOO_LARGE", "La solicitud excede el tamaño permitido."],
  415: ["UNSUPPORTED_MEDIA_TYPE", "Formato de archivo no admitido."],
  422: ["VALIDATION_ERROR", "Revisa los datos enviados."],
  429: ["RATE_LIMITED", "Demasiadas solicitudes. Intenta más tarde."],
  500: ["INTERNAL_ERROR", "Ocurrió un error interno."],
  503: ["NOT_READY", "Servicio temporalmente indisponible."],
};

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const supplied = req.get("X-Request-Id");
  const requestId = supplied && uuid.test(supplied) ? supplied : randomUUID();
  const started = performance.now();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.on("finish", () => {
    console.log(JSON.stringify({
      event: "request",
      at: new Date().toISOString(),
      requestId,
      status: res.statusCode,
      durationMs: Math.round(performance.now() - started),
    }));
  });
  next();
}

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    if (res.headersSent) return;
    const candidate = error instanceof HttpException ? error.getStatus() : 500;
    const status = Object.hasOwn(publicErrors, candidate) ? candidate : 500;
    const [code, message] = publicErrors[status];
    const requestId = typeof res.locals.requestId === "string" ? res.locals.requestId : randomUUID();
    if (error instanceof EditorialError) {
      res.status(status).json({
        code: error.code, message: error.message, requestId,
        ...(error.fieldErrors && { fieldErrors: error.fieldErrors }),
        ...(error.currentVersion && { currentVersion: error.currentVersion }),
      });
      return;
    }
    res.status(status).json({ code, message, requestId });
  }
}

export function jsonErrors(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }
  const oversized = typeof error === "object" && error !== null &&
    "type" in error && error.type === "entity.too.large";
  const status = oversized ? 413 : 400;
  const [code, message] = publicErrors[status];
  res.status(status).json({ code, message, requestId: res.locals.requestId });
}
