export function parseMediaOrigin(value: string, appOrigin: string): string {
  const url = new URL(value);
  const app = new URL(appOrigin);
  const localApp = app.protocol === "http:" && (["localhost", "127.0.0.1"].includes(app.hostname) ||
    (app.hostname === "web" && /^globows-v2-[0-9a-f]{10}$/.test(process.env.STACK_QA_PROJECT ?? "")));
  const localMedia = ["localhost", "127.0.0.1", "api"].includes(url.hostname);
  if (url.href !== `${url.origin}/` || url.username || url.password ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && localApp && localMedia))) {
    throw new Error("CMS_MEDIA_ORIGIN inválido");
  }
  return url.origin;
}
