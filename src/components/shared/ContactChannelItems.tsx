import { Camera, Globe, Mail, MessageCircle, Music2 } from "lucide-react";
import type { ContactLink } from "@/types/content";

const icons = { whatsapp: MessageCircle, facebook: Globe, instagram: Camera, tiktok: Music2, email: Mail };

export function ContactChannelItems({ links, describedBy }: { links: readonly ContactLink[]; describedBy: string }) {
  return <ul className="contact-channels">{links.map((channel) => {
    const Icon = icons[channel.id];
    const content = <><Icon className="icon" strokeWidth={1.75} aria-hidden="true" /><span>{channel.label}{!channel.href && <small>{channel.status === "missing" ? "Dato pendiente" : "Validación pendiente"}</small>}</span></>;
    return <li key={channel.id}>{channel.href ? <a className="channel-item" href={channel.href} {...(!channel.href.startsWith("mailto:") && { target: "_blank", rel: "noopener noreferrer" })} aria-label={`${channel.label}${channel.href.startsWith("mailto:") ? ", abrir correo" : ", abre un servicio externo"}`}>{content}</a> : <button className="channel-item" type="button" disabled aria-describedby={describedBy}>{content}</button>}</li>;
  })}</ul>;
}
