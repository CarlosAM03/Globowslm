import type { ContactLink } from "@/types/content";
import type { Contact } from "@/types/cms/public-site";
import { createWhatsappUrl } from "@/lib/whatsapp";

export function publicContact(contact?: Contact): ContactLink[] {
  const channels = [
    ["whatsapp", "WhatsApp", createWhatsappUrl(contact?.whatsapp ?? null, "general")],
    ["facebook", "Facebook", contact?.facebook],
    ["instagram", "Instagram", contact?.instagram],
    ["tiktok", "TikTok", contact?.tiktok],
    ["email", "Correo electrónico", contact?.email ? `mailto:${contact.email}` : null],
  ] as const;
  return channels.map(([id, label, href]) => ({ id, label, href: href ?? null, status: href ? "approved" : "missing" }));
}
