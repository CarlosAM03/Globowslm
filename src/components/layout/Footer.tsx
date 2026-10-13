import { BrandName } from "@/components/shared/BrandName";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ContactChannelItems } from "@/components/shared/ContactChannelItems";
import { getContactLinks, navigation } from "@/config/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <SectionContainer>
        <div className="footer-grid">
          <div className="footer-brand"><BrandName /><p>Creatividad, técnica y atención al detalle. Decoración profesional y formación presencial.</p></div>
          <nav aria-label="Navegación del pie de página"><h2>Explorar</h2><ul>{navigation.map((item) => <li key={item.href}><a className="footer-link" href={item.href}>{item.label}</a></li>)}</ul></nav>
          <div><h2>Contacto y redes</h2><p id="footer-contact-status" className="editorial-note">Canales pendientes de validación oficial.</p><ContactChannelItems links={getContactLinks()} describedBy="footer-contact-status" /></div>
        </div>
        <p className="footer-note">© Globows LM by Licey Márquez. Contenido en revisión editorial.</p>
      </SectionContainer>
    </footer>
  );
}
