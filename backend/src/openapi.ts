import type { OpenAPIObject } from "@nestjs/swagger";
import { z } from "zod";
import { loginSchema } from "./auth/auth.service.js";
import { contentInput, editorialPayloadSchemas, version } from "./editorial/dto.js";
import { edit, remove, ticket } from "./media/media.module.js";

type Operation = NonNullable<OpenAPIObject["paths"][string]["get"]>;
type OperationMethod = "get" | "post" | "patch" | "delete";
type RequestBody = NonNullable<Operation["requestBody"]>;
type Response = Operation["responses"][string];
type Schema = NonNullable<NonNullable<OpenAPIObject["components"]>["schemas"]>[string];

const error = { $ref: "#/components/schemas/ApiError" };
const uuid = { type: "string", format: "uuid" } as const;
const ordinal = { type: "integer", minimum: 1 } as const;
const bodyOptions = { target: "openapi-3.0", io: "input" } as const;
// Zod also supports general JSON Schema. The explicit target emits OpenAPI 3.0.
const schemaFor = (schema: z.ZodType): Schema => z.toJSONSchema(schema, bodyOptions) as unknown as Schema;
const requestBody = (schema: z.ZodType): RequestBody => ({
  required: true, content: { "application/json": { schema: schemaFor(schema) } },
});
const csrf = { name: "X-CSRF-Token", in: "header", required: true, schema: { type: "string" } } as const;
const origin = { name: "Origin", in: "header", required: true, schema: { type: "string", format: "uri" } } as const;
const documentedStatuses: Record<string, string> = {
  400: "Solicitud inválida", 401: "Sesión o ticket requerido", 403: "Origen o autorización inválidos",
  404: "Recurso no encontrado", 409: "Versión o referencia en conflicto", 413: "Límite superado",
  415: "Formato no admitido", 422: "Validación fallida", 429: "Límite de solicitudes", 503: "Servicio no disponible",
};

function response(status: string): Response {
  return { description: documentedStatuses[status], content: { "application/json": { schema: error } } };
}

export function documentApi(document: OpenAPIObject): OpenAPIObject {
  document.components ??= {};
  document.components.schemas ??= {};
  const schemas = document.components.schemas;
  schemas.ApiError = {
    type: "object", required: ["code", "message", "requestId"],
    properties: {
      code: { type: "string" }, message: { type: "string" }, requestId: uuid,
      fieldErrors: { type: "object", additionalProperties: { type: "string" } }, currentVersion: ordinal,
    },
  };
  for (const [kind, schema] of Object.entries(editorialPayloadSchemas)) {
    schemas[`EditorialPayload_${kind}`] = schemaFor(schema);
  }

  const envelope = { anyOf: Object.keys(editorialPayloadSchemas).map((kind) => ({ $ref: `#/components/schemas/EditorialPayload_${kind}` })) };
  const changes = z.strictObject({ version });
  const draft = requestBody(contentInput);
  const editedDraft = requestBody(contentInput.extend({ version }));

  const givePayloadSchema = (body: RequestBody) => {
    if ("content" in body) {
      const schema = body.content["application/json"].schema;
      if (schema && "properties" in schema && schema.properties) {
        schema.properties.payload = { ...envelope, description: "La variante debe corresponder al kind de la ruta." };
      }
    }
    return body;
  };

  const configure = (path: string, method: OperationMethod, apply: (operation: Operation) => void) => {
    const operation = document.paths[`/api/v1/${path}`]?.[method];
    if (operation) apply(operation);
  };
  const body = (path: string, method: OperationMethod, value: RequestBody) =>
    configure(path, method, (operation) => { operation.requestBody = value; });

  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of ["get", "post", "patch", "delete"] as const) {
      const operation = item[method];
      if (!operation) continue;
      const owner = path.startsWith("/api/v1/admin/") || ["/api/v1/auth/session", "/api/v1/auth/logout"].includes(path);
      if (owner) operation.security = [{ ownerSession: [] }];
      if ((owner && method !== "get") || path === "/api/v1/auth/login") {
        operation.parameters = [...(operation.parameters ?? []), origin, csrf];
      }
      for (const status of owner ? ["400", "401", "403", "404", "409", "413", "422", "503"] : ["400", "404", "503"]) {
        operation.responses[status] ??= response(status);
      }
    }
  }

  body("auth/login", "post", requestBody(loginSchema));
  configure("auth/login", "post", (operation) => {
    for (const status of ["401", "403", "429"]) operation.responses[status] = response(status);
  });
  configure("auth/csrf", "get", (operation) => {
    operation.parameters = [...(operation.parameters ?? []), origin];
    operation.responses["403"] = response("403");
    operation.responses["429"] = response("429");
  });
  body("admin/content/{kind}", "post", givePayloadSchema(draft));
  body("admin/content/{kind}/{id}", "patch", givePayloadSchema(editedDraft));
  body("admin/content/{kind}/{id}/{action}", "post", requestBody(changes));
  body("admin/content/{kind}/{id}/revisions/{number}/restore", "post", requestBody(changes));
  body("admin/media/upload-ticket", "post", requestBody(ticket));
  body("admin/media/{id}", "patch", requestBody(edit));
  body("admin/media/{id}", "delete", requestBody(remove));
  configure("media/upload", "post", (operation) => {
    operation.description = "Sube bytes directamente con el ticket de uso único. Límite de 15 MiB para fotos y 100 MiB para video.";
    operation.security = [{ uploadTicket: [] }];
    operation.parameters = [...(operation.parameters ?? []), origin];
    operation.requestBody = {
      required: true, content: Object.fromEntries(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]
        .map((mime) => [mime, { schema: { type: "string", format: "binary" } }])),
    };
    for (const status of ["401", "403", "413", "415", "422"]) operation.responses[status] = response(status);
  });
  configure("media/public/{id}", "get", (operation) => {
    operation.description = "Sirve bytes únicamente si el archivo pertenece a un snapshot publicado vigente.";
    operation.responses["206"] = { description: "Rango parcial en bytes" };
    operation.responses["416"] = { description: "Rango insatisfacible" };
  });
  configure("media/preview/{id}", "get", (operation) => {
    operation.description = "Requiere un ticket privado de lectura emitido para el archivo. Sin cache ni referrer.";
    operation.responses["401"] = response("401");
  });
  return document;
}
