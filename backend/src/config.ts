import { isAbsolute, parse } from "node:path";
import { Global, Module } from "@nestjs/common";

export type ApiConfig = {
  mode: "local" | "test" | "production";
  port: number;
  databaseUrl: string;
  mediaRoot: string;
  appOrigin: string;
};

export const API_CONFIG = Symbol("API_CONFIG");

function parseUrl(value: string | undefined, name: string): URL {
  try {
    return new URL(value ?? "");
  } catch {
    throw new Error(`${name} inválida`);
  }
}

export function loadConfig(env: NodeJS.ProcessEnv): ApiConfig {
  const mode = env.HARNESS_MODE ?? "production";
  if (mode !== "local" && mode !== "test" && mode !== "production") {
    throw new Error("HARNESS_MODE inválido");
  }

  const databaseUrl = parseUrl(env.DATABASE_URL, "DATABASE_URL");
  if (!["postgresql:", "postgres:"].includes(databaseUrl.protocol) ||
      !databaseUrl.hostname || !databaseUrl.username || !databaseUrl.password ||
      databaseUrl.pathname.length < 2 || databaseUrl.hash) {
    throw new Error("DATABASE_URL inválida");
  }

  const isolatedStack = mode === "local" && /^globows-v2-[0-9a-f]{10}$/.test(env.STACK_QA_PROJECT ?? "");
  const appOrigin = parseUrl(isolatedStack ? "http://web:3100" : env.APP_ORIGIN, "APP_ORIGIN");
  if (!["http:", "https:"].includes(appOrigin.protocol) || appOrigin.username ||
      appOrigin.password || appOrigin.href !== `${appOrigin.origin}/` ||
      (mode === "production" && appOrigin.protocol !== "https:")) {
    throw new Error("APP_ORIGIN inválida");
  }

  const mediaRoot = env.MEDIA_ROOT ?? "";
  if (!isAbsolute(mediaRoot) || parse(mediaRoot).root === mediaRoot) {
    throw new Error("MEDIA_ROOT debe ser un directorio absoluto dedicado");
  }

  const rawPort = env.PORT ?? "3101";
  const port = Number(rawPort);
  if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT inválido");
  }

  return { mode, port, databaseUrl: databaseUrl.href, mediaRoot, appOrigin: appOrigin.origin };
}

@Global()
@Module({
  providers: [{ provide: API_CONFIG, useFactory: () => loadConfig(process.env) }],
  exports: [API_CONFIG],
})
export class ConfigModule {}
