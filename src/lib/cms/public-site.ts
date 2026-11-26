import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import type { PublicSite } from "@/types/cms/public-site";
import { getCmsConfig } from "./auth-server";

export const loadPublicSite = cache(async (): Promise<PublicSite | null> => {
  await connection();
  try {
    const { apiOrigin } = getCmsConfig();
    const response = await fetch(new URL("/api/v1/public/site", apiOrigin), {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000), headers: { Accept: "application/json" },
    });
    return response.ok ? await response.json() as PublicSite : null;
  } catch {
    return null;
  }
});
