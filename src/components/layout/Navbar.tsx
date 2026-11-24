import { BrandName } from "@/components/shared/BrandName";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { navigation, type NavigationItem } from "@/config/site";
import { MobileMenu } from "./MobileMenu";
import { ButtonLink } from "@/components/ui/Button";

export function Navbar({ items = navigation, home = "#inicio", contact = "#contacto" }: {
  items?: readonly NavigationItem[]; home?: string; contact?: string;
}) {
  return (
    <header className="site-header">
      <SectionContainer className="navbar">
        <a href={home} aria-label="Globows LM by Licey Márquez, volver al inicio" className="brand-link"><BrandName /></a>
        <nav aria-label="Navegación principal" className="desktop-navigation">
          {items.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="navbar-actions"><ButtonLink href={contact} className="navbar-contact">Contacto</ButtonLink><MobileMenu items={items} /></div>
      </SectionContainer>
    </header>
  );
}
