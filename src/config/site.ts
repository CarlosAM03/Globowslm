import type { ContactChannel, ContactLink } from "@/types/content";
import { getApprovedDestination } from "@/lib/contact";
import { createWhatsappUrl, type WhatsappInterest } from "@/lib/whatsapp";

const channels: readonly ContactChannel[] = [
  { id: "whatsapp", label: "WhatsApp", status: "candidate", destination: "5216644846470", source: "legacy/index.html; no existe aprobación comercial registrada" },
  { id: "facebook", label: "Facebook", status: "candidate", destination: "https://www.facebook.com/globowslm", source: "MID: Anexo de enlaces; coincide con preview; aprobación de publicación pendiente" },
  { id: "instagram", label: "Instagram", status: "candidate", destination: "https://www.instagram.com/globows_lm/", source: "MID: Anexo de enlaces; coincide con preview; aprobación de publicación pendiente" },
  { id: "tiktok", label: "TikTok", status: "candidate", destination: "https://www.tiktok.com/@globows_liceymarquez", source: "MID: Anexo de enlaces; coincide con preview; aprobación de publicación pendiente" },
  { id: "email", label: "Correo electrónico", status: "missing", destination: null, source: "No hay correo verificable en documentación ni preview" },
];

export const site = {
  name: "Globows LM",
  founder: "Licey Márquez",
  repository: "https://github.com/CarlosAM03/Globowslm",
  channels,
  whatsappNumber: getApprovedDestination(channels[0]),
  phoneNumber: null as string | null,
  editorialStatus: "review",
} as const;

export function getContactLinks(interest: WhatsappInterest = "general"): readonly ContactLink[] {
  return site.channels.map((channel) => {
    const destination = getApprovedDestination(channel);
    return { id: channel.id, label: channel.label, status: channel.status,
      href: channel.id === "whatsapp" ? createWhatsappUrl(destination, interest) : destination };
  });
}

export const navigation = [
  { href: "#inicio", label: "Inicio" },
  { href: "#sobre-licey", label: "Sobre Licey" },
  { href: "#servicios", label: "Servicios y eventos" },
  { href: "#galeria", label: "Galería" },
  { href: "#formacion", label: "Formación" },
  { href: "#certificaciones", label: "Certificaciones" },
  { href: "#contacto", label: "Contacto" },
] as const;

export type NavigationItem = { readonly href: string; readonly label: string };
