import { isAbsolute, parse } from "node:path";
import { Global, Module } from "@nestjs/common";

export type StorageConfig = { origin: string; bucket: string; key: string };

export type ApiConfig = {
  mode: "local" | "test" | "production";
  port: number;
  databaseUrl: string;
  mediaRoot: string;
  appOrigin: string;
  videoLimitMiB: 45 | 100;
  bffSecret?: string;
  cloudStorage?: StorageConfig;
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

  const videoLimit = env.MEDIA_VIDEO_LIMIT_MIB ?? (mode === "production" ? "45" : "100");
  if ((videoLimit !== "45" && videoLimit !== "100") || (mode === "production" && videoLimit !== "45")) {
    throw new Error("MEDIA_VIDEO_LIMIT_MIB inválido");
  }
  const bffSecret = env.CMS_BFF_SECRET;
  if ((mode === "production" || bffSecret !== undefined) && !/^[A-Za-z0-9_-]{43,86}$/.test(bffSecret ?? "")) {
    throw new Error("CMS_BFF_SECRET inválido");
  }
  if (mode === "production" && databaseUrl.searchParams.get("sslmode") !== "verify-full") {
    throw new Error("DATABASE_URL requiere sslmode=verify-full");
  }
  const storageEnabled = [env.SUPABASE_PROJECT_URL, env.SUPABASE_MEDIA_BUCKET, env.SUPABASE_STORAGE_KEY].some((value) => value !== undefined);
  let cloudStorage: StorageConfig | undefined;
  if (mode === "production" || storageEnabled) {
    const url = parseUrl(env.SUPABASE_PROJECT_URL, "SUPABASE_PROJECT_URL");
    const bucket = env.SUPABASE_MEDIA_BUCKET ?? "";
    const key = env.SUPABASE_STORAGE_KEY ?? "";
    if (url.protocol !== "https:" || url.port || !/^[a-z0-9]{20}\.supabase\.co$/.test(url.hostname) ||
        url.href !== `${url.origin}/` || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(bucket) ||
        !/^sb_secret_[A-Za-z0-9_-]{20,200}$/.test(key) || videoLimit !== "45") {
      throw new Error("Configuración de Storage privado inválida");
    }
    cloudStorage = { origin: url.origin, bucket, key };
  }

  return {
    mode, port, databaseUrl: databaseUrl.href, mediaRoot, appOrigin: appOrigin.origin,
    videoLimitMiB: videoLimit === "45" ? 45 : 100, ...(bffSecret && { bffSecret }), ...(cloudStorage && { cloudStorage }),
  };
}

@Global()
@Module({
  providers: [{ provide: API_CONFIG, useFactory: () => loadConfig(process.env) }],
  exports: [API_CONFIG],
})
export class ConfigModule {}
