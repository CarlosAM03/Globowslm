"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { ContactLink } from "@/types/content";
import { ContactChannelItems } from "@/components/shared/ContactChannelItems";

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
        {open ? <X size={24} strokeWidth={1.75} aria-hidden="true" /> : <Plus size={24} strokeWidth={1.75} aria-hidden="true" />}
      </button>
      <div id="floating-contact-panel" className="floating-panel" hidden={!open} role="region" aria-label="Contacto rápido">
        <h2>Contacto rápido</h2>
        <p id="floating-contact-status" className="editorial-note">Los destinos se habilitarán al completar su validación oficial.</p>
        <ContactChannelItems links={links} describedBy="floating-contact-status" />
      </div>
    </div>
  );
}
