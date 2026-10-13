import { BrandName } from "@/components/shared/BrandName";
import { SectionContainer } from "@/components/shared/SectionContainer";

export function Footer() {
  return (
    <footer className="site-footer">
      <SectionContainer>
        <div className="footer-grid">
          <BrandName />
          <p>Creatividad, técnica y atención al detalle.<br />Decoración profesional y formación presencial.</p>
          <a className="footer-link" href="#inicio">Volver al inicio</a>
        </div>
        <p className="footer-note">© Globows LM by Licey Márquez. Versión en revisión editorial; los canales oficiales de contacto se incorporarán tras su validación.</p>
      </SectionContainer>
    </footer>
  );
}
