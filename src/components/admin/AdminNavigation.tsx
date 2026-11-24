"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", title: "Panel" },
  { href: "/admin/institucional", title: "Institucional" },
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
