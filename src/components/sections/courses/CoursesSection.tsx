import Image from "next/image";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { ContextualContact } from "@/components/shared/ContextualContact";
import { trainingContent } from "@/content/training";
import { services } from "@/content/services";
import "./courses.css";

export function CoursesSection() {
  return (
    <section id="formacion" className="section training-section" aria-labelledby="training-title">
      <SectionContainer>
        <div className="training-editorial">
          <div>
            <SectionTitle id="training-title" eyebrow={trainingContent.eyebrow} description={trainingContent.description}>{trainingContent.title}</SectionTitle>
            <p id="training-status" className="editorial-note">La oferta detallada, temarios, fechas y fotografías de docencia están pendientes de validación. Las consultas se habilitarán al confirmar el canal oficial.</p>
          </div>
          <figure className="training-figure">
            <Image src={trainingContent.image.src} width={trainingContent.image.width} height={trainingContent.image.height} alt={trainingContent.image.alt} sizes="(min-width: 768px) 50vw, 100vw" />
            <figcaption className="editorial-note">{trainingContent.imageCaption}</figcaption>
          </figure>
        </div>
        <div className="training-grid">{services.filter((service) => service.interest !== "decoracion").map((service) => <article key={service.id} className="training-card" aria-labelledby={`training-${service.id}`}>
          <h3 id={`training-${service.id}`}>{service.name}</h3>
          <p>{service.description}</p>
          <ContextualContact interest={service.interest} label={service.contactLabel} describedBy="training-status" />
        </article>)}</div>
      </SectionContainer>
    </section>
  );
}
