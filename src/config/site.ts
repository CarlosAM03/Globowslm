export const site = {
  name: "Globows LM",
  founder: "Licey Márquez",
  repository: "https://github.com/CarlosAM03/Globowslm",
  // The number in the historical preview has not been commercially validated.
  whatsappNumber: null as string | null,
  editorialStatus: "review",
} as const;

export const navigation = [
  { href: "#inicio", label: "Inicio" },
  { href: "#sobre-licey", label: "Sobre Licey" },
  { href: "#servicios", label: "Servicios y eventos" },
  { href: "#galeria", label: "Galería" },
] as const;

export type NavigationItem = { readonly href: string; readonly label: string };
