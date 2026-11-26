export function getCmsConfig() {
  const app = new URL(process.env.APP_ORIGIN ?? "");
  const api = new URL(process.env.CMS_API_INTERNAL_URL ?? "");
  const isOrigin = (url: URL) => !url.username && !url.password && url.href === `${url.origin}/`;
  const local = app.protocol === "http:" && (["127.0.0.1", "localhost"].includes(app.hostname) ||
    (app.hostname === "web" && /^globows-v2-[0-9a-f]{10}$/.test(process.env.STACK_QA_PROJECT ?? "")));
  if (!isOrigin(app) || !isOrigin(api) || (!local && app.protocol !== "https:") ||
      (api.protocol !== "https:" && !(local && api.protocol === "http:" && ["api", "localhost", "127.0.0.1"].includes(api.hostname)))) {
    throw new Error("Configuración CMS inválida");
  }
  return { appOrigin: app.origin, apiOrigin: api.origin, secure: app.protocol === "https:" };
}
