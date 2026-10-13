import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { ContextualContact } from "@/components/shared/ContextualContact";
import { ContactChannelItems } from "@/components/shared/ContactChannelItems";
import { getContactLinks, site } from "@/config/site";

export function ContactSection() {
  return (
    <section id="contacto" className="section contact-section" aria-labelledby="contact-title">
      <SectionContainer>
        <div className="contact-grid">
          <div>
            <SectionTitle id="contact-title" eyebrow="Hablemos" description="Cuéntanos tu interés en decoración, cursos, talleres, certificaciones o asesorías. El contacto se realiza directamente por los canales de Globows LM.">Demos forma a tu próxima idea.</SectionTitle>
            <ContextualContact interest="general" label="Contactar por WhatsApp" describedBy="contact-status" />
            <p id="contact-status" className="editorial-note">Nuestra sede principal de cursos y talleres se encuentra en Tijuana, Baja California, México. Contamos con alcance regional para decoraciones y eventos en los municipios cercanos.</p>
            <p className="contact-phone">{site.phoneNumber ? <a href={`tel:${site.phoneNumber}`}>Teléfono: {site.phoneDisplay}</a> : "Teléfono oficial pendiente de validación."}</p>
          </div>
          <div className="contact-panel"><h3>Canales de contacto</h3><ContactChannelItems links={getContactLinks()} describedBy="contact-status" /></div>
        </div>
      </SectionContainer>
    </section>
  );
}
