import Image from "next/image";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { services } from "@/content/services";
import { galleryCategories, galleryImages } from "@/content/gallery";
import { ServiceCard } from "./ServiceCard";

export function ServicesEventsSection() {
  return (
    <section id="servicios" className="section services-section" aria-labelledby="services-title">
      <SectionContainer>
        <SectionTitle id="services-title" eyebrow="Servicios y eventos" description="La oferta de Globows LM reúne decoración profesional, aprendizaje y orientación. Cada servicio responde a un interés distinto.">Servicios Curados</SectionTitle>
        <p id="contact-channel-status" className="editorial-note contact-status">Consulta disponibilidad y precios por WhatsApp. La imagen de acreditación del servicio de certificaciones todavía no está disponible.</p>
        <div className="services-grid">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>
        <div className="events-heading"><h3>Ocasiones decorativas</h3><p>La ocasión describe el contexto de una decoración; no sustituye al servicio. Estas categorías corresponden al material visual disponible.</p></div>
        <div className="events-grid">{galleryCategories.map((category) => {
          const image = galleryImages.find((entry) => entry.category === category.id);
          return image ? <figure className="event-card" key={category.id}><Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes="(min-width: 768px) 33vw, 100vw" /><figcaption>{category.label}</figcaption></figure> : null;
        })}</div>
      </SectionContainer>
    </section>
  );
}
