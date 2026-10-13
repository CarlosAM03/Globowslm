import { BrandName } from "@/components/shared/BrandName";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { navigation } from "@/config/site";
import { MobileMenu } from "./MobileMenu";
import "./layout.css";

export function Navbar() {
  return (
    <header className="site-header">
      <SectionContainer className="navbar">
        <a href="#inicio" aria-label="Globows LM, volver al inicio" className="brand-link"><BrandName /></a>
        <nav aria-label="Navegación principal" className="desktop-navigation">
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <MobileMenu items={navigation} />
      </SectionContainer>
    </header>
  );
}
