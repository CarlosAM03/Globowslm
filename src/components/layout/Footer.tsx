import { BrandName } from "@/components/shared/BrandName";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ContactChannelItems } from "@/components/shared/ContactChannelItems";
import type { ContactLink } from "@/types/content";
import { getContactLinks, navigation, type NavigationItem } from "@/config/site";

export function Footer({ items = navigation, links = getContactLinks() }: {
  items?: readonly NavigationItem[]; links?: readonly ContactLink[];
}) {
  return (
    <footer className="site-footer">
      <SectionContainer>
        <div className="footer-grid">
          <div className="footer-brand"><BrandName /><p>Elevando el estilo con globos a la categoría de arte. Educación, Inspiración y Creación. Hazlo con amor, dilo con Globows.</p></div>
          <nav aria-label="Navegación del pie de página"><h2>Explorar</h2><ul>{items.map((item) => <li key={item.href}><a className="footer-link" href={item.href}>{item.label}</a></li>)}</ul></nav>
          <div><h2>Contacto y redes</h2><p id="footer-contact-status" className="editorial-note">Contacto directo con Globows LM.{links.some(({ id, href }) => id === "email" && !href) ? " Correo electrónico no disponible." : ""}</p><ContactChannelItems links={links} describedBy="footer-contact-status" /></div>
        </div>
        <p className="footer-note">© 2019 Globows LM. Hazlo con amor, dilo con Globows.</p>
      </SectionContainer>
    </footer>
  );
}
