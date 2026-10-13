"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Globe, Mail, MessageCircle, Music2, Plus, X } from "lucide-react";
import type { ContactLink } from "@/types/content";
const icons = { whatsapp: MessageCircle, facebook: Globe, instagram: Camera, tiktok: Music2, email: Mail };

export function FloatingContactPanel({ links }: { links: readonly ContactLink[] }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    function onOutsideClick(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onOutsideClick);
    return () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("pointerdown", onOutsideClick); };
  }, [open]);
  return (
    <div ref={root} className="floating-contact" onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <button ref={trigger} type="button" className="floating-trigger" aria-label={open ? "Cerrar canales de contacto" : "Abrir canales de contacto"} aria-expanded={open} aria-controls="floating-contact-panel" onClick={() => setOpen(!open)}>
        {open ? <X size={32} strokeWidth={1.75} aria-hidden="true" /> : <Plus size={32} strokeWidth={1.75} aria-hidden="true" />}
      </button>
      <div id="floating-contact-panel" className="floating-panel" hidden={!open} role="region" aria-label="Contacto rápido">
        <ul>{links.map((channel) => {
          const Icon = icons[channel.id];
          const content = <><Icon size={24} strokeWidth={1.75} aria-hidden="true" /><span className="floating-label">{channel.label}{!channel.href ? " · No disponible" : ""}</span></>;
          return <li key={channel.id}>{channel.href ? <a href={channel.href} className="floating-channel" aria-label={`${channel.label}, ${channel.href.startsWith("mailto:") ? "abrir correo" : "abre un servicio externo"}`} {...(!channel.href.startsWith("mailto:") && { target: "_blank", rel: "noopener noreferrer" })}>{content}</a> : <button type="button" className="floating-channel" disabled aria-label={`${channel.label}, dirección no disponible`}>{content}</button>}</li>;
        })}</ul>
      </div>

    </div>
  );
}
