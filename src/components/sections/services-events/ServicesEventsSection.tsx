import Image from "next/image";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { services } from "@/content/services";
import { galleryCategories, galleryImages } from "@/content/gallery";
import { ServiceCard } from "./ServiceCard";
import "./services-events.css";

export function ServicesEventsSection() {
  return (
    <section id="servicios" className="section services-section" aria-labelledby="services-title">
      <SectionContainer>
        <SectionTitle id="services-title" eyebrow="Servicios y eventos" description="La oferta de Globows LM reúne decoración profesional, aprendizaje y orientación. Cada servicio responde a un interés distinto.">Creatividad para celebrar. Formación para crecer.</SectionTitle>
        <p id="contact-channel-status" className="editorial-note contact-status">Las consultas por WhatsApp se habilitarán después de validar el número oficial. Las fotografías y los textos comerciales están en revisión.</p>
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
