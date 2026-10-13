"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavigationItem } from "@/config/site";

export function MobileMenu({ items }: { items: readonly NavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    function onViewportChange() { if (desktop.matches) setOpen(false); }
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onViewportChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onViewportChange);
    };
  }, [open]);

  return (
    <div className="mobile-menu">
      <button ref={trigger} type="button" className="menu-trigger" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}>
        {open ? <X strokeWidth={1.75} aria-hidden="true" /> : <Menu strokeWidth={1.75} aria-hidden="true" />}
      </button>
      <nav id="mobile-navigation" aria-label="Navegación móvil" className="mobile-navigation" hidden={!open}>
        {items.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
      </nav>
    </div>
  );
}
