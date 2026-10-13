import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ButtonLink } from "@/components/ui/Button";
import { ContextualContact } from "@/components/shared/ContextualContact";
import { heroContent } from "@/content/institutional";

export function HeroSection() {
  return (
    <section id="inicio" className="hero section" aria-labelledby="hero-title">
      <Image src={heroContent.image.src} fill alt={heroContent.image.alt} sizes="100vw" loading="eager" fetchPriority="high" className="hero-image" />
      <div className="hero-overlay" aria-hidden="true" />
      <SectionContainer className="hero-editorial">
        <div className="hero-copy">
          <p className="eyebrow">{heroContent.eyebrow}</p>
          <h1 id="hero-title">{heroContent.title}</h1>
          <p className="hero-subtitle">{heroContent.subtitle}</p>
          <p className="hero-description">{heroContent.description}</p>
          <div className="hero-actions">
            <ContextualContact interest="decoracion" label="Consultar por WhatsApp" describedBy="hero-title" />
            <ButtonLink href="#galeria" variant="secondary">Ver portafolio</ButtonLink>
          </div>
          <a href="#sobre-licey" className="hero-discover"><ArrowDown className="icon" strokeWidth={1.75} aria-hidden="true" /> Conoce a Licey</a>
        </div>
      </SectionContainer>
    </section>
  );
}
