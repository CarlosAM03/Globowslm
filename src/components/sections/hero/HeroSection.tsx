import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ButtonLink } from "@/components/ui/Button";
import { heroContent } from "@/content/institutional";
import "./hero.css";

export function HeroSection() {
  return (
    <section id="inicio" className="hero section" aria-labelledby="hero-title">
      <Image src={heroContent.image.src} fill alt={heroContent.image.alt} sizes="100vw" loading="eager" fetchPriority="high" className="hero-image" />
      <div className="hero-overlay" aria-hidden="true" />
      <SectionContainer className="hero-editorial">
        <div className="hero-copy">
          <p className="eyebrow">{heroContent.eyebrow}</p>
          <h1 id="hero-title">{heroContent.title}</h1>
          <p className="hero-subtitle">Formamos profesionales capaces de crear las suyas.</p>
          <p className="hero-description">{heroContent.description}</p>
          <div className="hero-actions">
            <ButtonLink href="#servicios">Explorar servicios <ArrowUpRight className="icon" strokeWidth={1.75} aria-hidden="true" /></ButtonLink>
            <ButtonLink href="#galeria" variant="secondary">Ver portafolio</ButtonLink>
          </div>
          <a href="#sobre-licey" className="hero-discover"><ArrowDown className="icon" strokeWidth={1.75} aria-hidden="true" /> Conoce a Licey</a>
        </div>
      </SectionContainer>
    </section>
  );
}
