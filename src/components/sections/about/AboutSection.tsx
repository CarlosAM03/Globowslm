import Image from "next/image";
import { Check } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { aboutContent } from "@/content/institutional";
import { ButtonLink } from "@/components/ui/Button";
import "./about.css";

export function AboutSection() {
  return (
    <section id="sobre-licey" className="section" aria-labelledby="about-title">
      <SectionContainer>
        <div className="about-grid">
          <figure className="about-figure">
            <Image src={aboutContent.image.src} width={aboutContent.image.width} height={aboutContent.image.height} alt={aboutContent.image.alt} sizes="(min-width: 1024px) 45vw, (min-width: 768px) 560px, 100vw" className="about-image" />
            <figcaption className="editorial-note">Licey Márquez · Composición promocional del archivo de la marca, conservada íntegramente.</figcaption>
          </figure>
          <div className="about-copy">
            <SectionTitle id="about-title" eyebrow="Sobre Licey">Licey Márquez</SectionTitle>
            <p>{aboutContent.introduction}</p>
            <p>{aboutContent.philosophy}</p>
            <p>{aboutContent.value}</p>
            <ul className="about-values">{aboutContent.values.map((value) => <li key={value}><Check className="icon" strokeWidth={1.75} aria-hidden="true" />{value}</li>)}</ul>
            <ButtonLink variant="secondary" href="#trayectoria">Conocer su trayectoria</ButtonLink>
          </div>
        </div>
        <ol id="trayectoria" className="about-story" aria-label="Trayectoria de la marca">
          {aboutContent.milestones.map((milestone, index) => <li key={milestone.title}><span className="story-step" aria-hidden="true">0{index + 1}</span><h3>{milestone.title}</h3><p>{milestone.text}</p></li>)}
        </ol>
      </SectionContainer>
    </section>
  );
}
