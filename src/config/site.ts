import type { ContactChannel, ContactLink } from "@/types/content";
import { getApprovedDestination } from "@/lib/contact";
import { createWhatsappUrl, type WhatsappInterest } from "@/lib/whatsapp";

const channels: readonly ContactChannel[] = [
  { id: "whatsapp", label: "WhatsApp", status: "approved", destination: "5216644846470", source: "legacy/index.html; preview aprobado por la clienta; confirmación expresa del responsable, Sprint 4–5" },
  { id: "facebook", label: "Facebook", status: "approved", destination: "https://www.facebook.com/globowslm", source: "MID: Anexo de enlaces; coincide con preview; publicación aprobada por la clienta, confirmada por el responsable" },
  { id: "instagram", label: "Instagram", status: "approved", destination: "https://www.instagram.com/globows_lm/", source: "MID: Anexo de enlaces; coincide con preview; publicación aprobada por la clienta, confirmada por el responsable" },
  { id: "tiktok", label: "TikTok", status: "approved", destination: "https://www.tiktok.com/@globows_liceymarquez", source: "MID: Anexo de enlaces; coincide con preview; publicación aprobada por la clienta, confirmada por el responsable" },
  { id: "email", label: "Correo electrónico", status: "missing", destination: null, source: "No hay correo verificable en documentación ni preview" },
];

export const site = {
  name: "Globows LM",
  founder: "Licey Márquez",
  repository: "https://github.com/CarlosAM03/Globowslm",
  channels,
  whatsappNumber: getApprovedDestination(channels[0]),
  phoneNumber: "+526644846470",
  phoneDisplay: "+52 664 484 6470",
  editorialStatus: "approved-preview",
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
  { href: "#confianza", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
] as const;

export type NavigationItem = { readonly href: string; readonly label: string };
