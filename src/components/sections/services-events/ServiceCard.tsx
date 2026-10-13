import Image from "next/image";
import { BadgeCheck, Compass, GraduationCap, PartyPopper, Users } from "lucide-react";
import { ContextualContact } from "@/components/shared/ContextualContact";
import type { Service } from "@/types/content";

const icons = { decoracion: PartyPopper, cursos: GraduationCap, talleres: Users, certificaciones: BadgeCheck, asesorias: Compass, general: Compass };

export function ServiceCard({ service }: { service: Service }) {
  const Icon = icons[service.interest];
  return (
    <article className="service-card" aria-labelledby={`service-${service.id}`}>
      {service.image ? <div className="service-image"><Image {...{ src: service.image.src, width: service.image.width, height: service.image.height, alt: service.image.alt }} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" /></div> :
        <div className="service-image service-image--pending"><Icon size={40} strokeWidth={1.75} aria-hidden="true" /><p className="editorial-note">Fotografía del servicio pendiente de validación.</p></div>}
      <div className="service-body">
        <h3 id={`service-${service.id}`}>{service.name}</h3>
        <p>{service.description}</p>
        <ContextualContact interest={service.interest} label={service.contactLabel} describedBy="contact-channel-status" />
      </div>
    </article>
  );
}
