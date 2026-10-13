export const seo = {
  title: "Globows LM by Licey Márquez | Hazlo con amor, dilo con Globows",
  description: "Elevando el estilo con globos a la categoría de arte. Decoración profesional, cursos intensivos, talleres y mentorías en Tijuana.",
  currentDeployment: "https://globowslm.vercel.app",
  image: "/images/hero/decoracion-globows.webp",
} as const;

// Set only after the responsible owner confirms the permanent public origin.
export function getCanonicalOrigin(value: string | undefined): string | null {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("GLOBOWS_CANONICAL_URL must be an approved HTTPS origin");
  return url.origin;
}
export const canonicalOrigin = getCanonicalOrigin(process.env.GLOBOWS_CANONICAL_URL);
