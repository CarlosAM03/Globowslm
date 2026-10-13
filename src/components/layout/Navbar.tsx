import { BrandName } from "@/components/shared/BrandName";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { navigation } from "@/config/site";
import { MobileMenu } from "./MobileMenu";
import { ButtonLink } from "@/components/ui/Button";
import "./layout.css";

export function Navbar() {
  return (
    <header className="site-header">
      <SectionContainer className="navbar">
        <a href="#inicio" aria-label="Globows LM, volver al inicio" className="brand-link"><BrandName /></a>
        <nav aria-label="Navegación principal" className="desktop-navigation">
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="navbar-actions"><ButtonLink href="#contacto" className="navbar-contact">Contacto</ButtonLink><MobileMenu items={navigation} /></div>
      </SectionContainer>
    </header>
  );
}
