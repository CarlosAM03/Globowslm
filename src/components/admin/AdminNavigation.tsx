"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", title: "Panel" },
  { href: "/admin/institucional", title: "Institucional" },
  { href: "/admin/servicios", title: "Servicios" },
  { href: "/admin/galerias", title: "Galerías" },
  { href: "/admin/formacion", title: "Formación" },
  { href: "/admin/certificaciones", title: "Certificaciones" },
  { href: "/admin/blog", title: "Blog" },
  { href: "/admin/multimedia", title: "Multimedia" },
  { href: "/admin/publicaciones", title: "Publicaciones" },
  { href: "/", title: "Ver sitio" },
] as const;

export function AdminNavigation() {
  const current = usePathname();
  const options = links.map((link) => (
    <Link key={link.href} href={link.href} aria-current={current === link.href ? "page" : undefined}>
      {link.title}
    </Link>
  ));
  return (
    <>
      <nav className="admin-navigation-desktop" aria-label="Administración">{options}</nav>
      <details className="admin-navigation-mobile">
        <summary>Menú</summary>
        <nav aria-label="Administración">{options}</nav>
      </details>
    </>
  );
}
