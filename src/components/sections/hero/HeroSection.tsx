import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { ButtonLink } from "@/components/ui/Button";
import { heroContent } from "@/content/institutional";
import "./hero.css";

export function HeroSection() {
  return (
    <section id="inicio" className="hero section" aria-labelledby="hero-title">
      <SectionContainer className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{heroContent.eyebrow}</p>
          <h1 id="hero-title">{heroContent.title}</h1>
          <p className="hero-description">{heroContent.description}</p>
          <div className="hero-actions">
            <ButtonLink href="#sobre-licey">Conocer a Licey <ArrowUpRight className="icon" strokeWidth={1.75} aria-hidden="true" /></ButtonLink>
          </div>
          <a href="#sobre-licey" className="hero-discover"><ArrowDown className="icon" strokeWidth={1.75} aria-hidden="true" /> Conoce a Licey</a>
        </div>
        <figure className="hero-figure">
          <Image src={heroContent.image.src} width={heroContent.image.width} height={heroContent.image.height} alt={heroContent.image.alt} sizes="(min-width: 1024px) 50vw, (min-width: 768px) 560px, 100vw" loading="eager" fetchPriority="high" className="hero-image" />
          <div className="hero-overlay" aria-hidden="true" />
          <figcaption><span>Globows LM</span><span>Detalles que acompañan cada celebración.</span></figcaption>
        </figure>
      </SectionContainer>
    </section>
  );
}
