import { PublishedImage } from "@/components/shared/PublishedImage";
import Link from "next/link";
import { ArrowDown, BadgeCheck, Check, FileCheck } from "lucide-react";
import { ContextualContact } from "@/components/shared/ContextualContact";
import { ContactChannelItems } from "@/components/shared/ContactChannelItems";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { ButtonLink } from "@/components/ui/Button";
import { AssetImage } from "@/components/blog/BlogContent";
import { publicContact } from "@/lib/cms/public-contact";
import type { PublicAsset } from "@/types/cms/public-blog";
import type { PublicSite, SiteView } from "@/types/cms/public-site";
import type { GalleryImage } from "@/types/content";
import { HorizontalTimeline } from "./certifications/HorizontalTimeline";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { ServiceCard } from "./services-events/ServiceCard";

const labels = {
  decoracion: "Consultar decoración", cursos: "Consultar cursos", talleres: "Consultar talleres",
  certificaciones: "Consultar certificaciones", asesorias: "Consultar asesorías", general: "Consultar",
} as const;
const videoSource = (asset: PublicAsset) => `/api/cms/public/media/${asset.id}`;

function hero(site: SiteView) {
  const { hero: cover, contact } = site;
  return <section id="inicio" className="hero section" aria-labelledby="hero-title">
    {cover.photo ? <PublishedImage src={videoSource(cover.photo)} fill alt={cover.photo.alt} sizes="100vw"
      loading="eager" fetchPriority="high" className="hero-image" /> : null}
    <div className="hero-overlay" aria-hidden="true" />
    <SectionContainer className="hero-editorial">
      <div className="hero-copy">
        <p className="eyebrow">Decoración profesional y formación</p>
        <h1 id="hero-title">{cover.title}</h1>
        {cover.subtitle ? <p className="hero-subtitle">{cover.subtitle}</p> : null}
        <p className="hero-description">{site.seo.description}</p>
        <div className="hero-actions">
          <ContextualContact interest="decoracion" label="Consultar por WhatsApp" describedBy="hero-title" number={contact.whatsapp ?? null} />
          <ButtonLink href="#galeria" variant="secondary">Ver portafolio</ButtonLink>
        </div>
        <a href="#sobre-licey" className="hero-discover"><ArrowDown className="icon" aria-hidden="true" /> Conoce a {site.founderName}</a>
      </div>
    </SectionContainer>
  </section>;
}

function about(site: SiteView) {
  const { about: section, trajectory } = site;
  return <section id="sobre-licey" className="section" aria-labelledby="about-title">
    <SectionContainer>
      <div className={section.portrait ? "about-grid" : undefined}>
        {section.portrait ? <figure className="about-figure"><AssetImage asset={section.portrait} sizes="(min-width: 1024px) 520px, (min-width: 768px) 45vw, calc(100vw - 48px)" /></figure> : null}
        <div className="about-copy">
          <SectionTitle id="about-title" eyebrow={section.title}>{site.founderName}</SectionTitle>
          <p>{section.history}</p>{section.philosophy ? <p>{section.philosophy}</p> : null}
          {trajectory ? <ButtonLink variant="secondary" href="#trayectoria">Conocer su trayectoria</ButtonLink> : null}
        </div>
      </div>
      {trajectory ? <ul id="trayectoria" className="about-story" aria-label="Trayectoria de la marca">
        {trajectory.split("\n").filter(Boolean).map((line, index) => <li key={index}><Check className="icon" aria-hidden="true" /><p>{line}</p></li>)}
      </ul> : null}
    </SectionContainer>
  </section>;
}

function sections(content: PublicSite, site: SiteView) {
  const images: GalleryImage[] = content.galleries.flatMap(({ slug, data }) => data.photos.map((photo, index) => ({
    id: `${slug}-${index}`, category: data.category, title: photo.caption || data.title,
    src: videoSource(photo), width: photo.width ?? 720, height: photo.height ?? 480, alt: photo.alt, approval: "approved" as const,
  })));
  const categories = content.categories.map(({ slug, data }) => ({ id: slug, label: data.title }));
  const events = content.eventTypes.length ? content.eventTypes.map(({ slug, data }) => ({
    slug, title: data.title, description: data.description, image: data.image,
  })) : categories.map(({ id, label }) => ({ slug: id, title: label, description: undefined, image: null }));
  return <>
    <section id="servicios" className="section services-section" aria-labelledby="services-title">
      <SectionContainer>
        <SectionTitle id="services-title" eyebrow="Servicios y eventos">Servicios Curados</SectionTitle>
        <p id="contact-channel-status" className="editorial-note contact-status">Consulta disponibilidad y precios con {site.brandName}.</p>
        {content.services.length ? <div className="services-grid">{content.services.map(({ slug, data }) =>
          <ServiceCard key={slug} number={site.contact.whatsapp ?? null} service={{
            id: slug, name: data.title, description: data.description, interest: data.ctaInterest, contactLabel: labels[data.ctaInterest], source: "",
            ...(data.image && { image: { src: videoSource(data.image), width: data.image.width ?? 720,
              height: data.image.height ?? 480, alt: data.image.alt, approval: "approved" as const } }),
          }} />)}</div> : <p>Aún no hay servicios publicados.</p>}
        {events.length ? <><div className="events-heading"><h3>Ocasiones decorativas</h3></div>
          <div className="events-grid">{events.map((event) => {
            const photo = images.find((image) => image.category === event.slug);
            return <figure className="event-card" key={event.slug}>
              {event.image ? <AssetImage asset={event.image} /> : photo ? <PublishedImage src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} /> : null}
              <figcaption>{event.title}{event.description ? <p>{event.description}</p> : null}</figcaption>
            </figure>;
          })}</div></> : null}
      </SectionContainer>
    </section>
    <section id="galeria" className="section gallery-section" aria-labelledby="gallery-title">
      <SectionContainer>
        <SectionTitle id="gallery-title" eyebrow="Galería de decoraciones">Nuestro Trabajo</SectionTitle>
        {images.length ? <GalleryGrid categories={categories} images={images} /> : <p>Aún no hay fotografías publicadas.</p>}
      </SectionContainer>
    </section>
    <section id="formacion" className="section training-section" aria-labelledby="training-title">
      <SectionContainer>
        <SectionTitle id="training-title" eyebrow="La Academia">Formación presencial</SectionTitle>
        <p id="training-status" className="editorial-note">Consulta disponibilidad, fechas y precios directamente con {site.brandName}.</p>
        {content.training.length ? <div className="training-grid">{content.training.map(({ slug, data }) =>
          <article key={slug} className="training-card">
            <h3>{data.title}</h3><p>{data.description}</p>
            {data.photo ? <AssetImage asset={data.photo} /> : null}
            {data.video ? <video controls preload="metadata" src={videoSource(data.video)} aria-label={data.title} /> : null}
            <ContextualContact interest={data.ctaInterest} label={labels[data.ctaInterest]} describedBy="training-status" number={site.contact.whatsapp ?? null} />
          </article>)}</div> : <p>Aún no hay ofertas de formación publicadas.</p>}
      </SectionContainer>
    </section>
    <section id="certificaciones" className="section certifications-section" aria-labelledby="certifications-title">
      <SectionContainer>
        <SectionTitle id="certifications-title" eyebrow="Certificaciones y trayectoria">Preparación que acompaña cada creación.</SectionTitle>
        {content.certifications.length ? <HorizontalTimeline>{content.certifications.map(({ slug, data }) =>
          <li key={slug} className="certification-card"><BadgeCheck size={32} aria-hidden="true" />
            <h3>{data.title}</h3><p>{data.issuer}</p>{data.date ? <time dateTime={data.date}>{data.date}</time> : null}
            {data.description ? <p>{data.description}</p> : null}
            {data.evidence.map((media) => media.mime.startsWith("image/") ?
              <AssetImage key={media.id} asset={media} /> :
              <video key={media.id} controls preload="metadata" src={videoSource(media)} aria-label={data.title} />)}
          </li>)}</HorizontalTimeline> :
          <div className="certification-empty" role="note"><FileCheck size={32} aria-hidden="true" />
            <div><h3>Credenciales en validación</h3><p>Los nombres, organismos y evidencias de las credenciales se incorporarán una vez verificados.</p></div>
          </div>}
      </SectionContainer>
    </section>
    {site.faq.length ? <section id="confianza" className="section" aria-labelledby="faq-title">
      <SectionContainer>
        <SectionTitle id="faq-title">Preguntas frecuentes</SectionTitle>
        {site.faq.map(({ question, answer }, index) => <details key={index} className="faq-item"><summary>{question}</summary><p>{answer}</p></details>)}
      </SectionContainer>
    </section> : null}
    <section id="contacto" className="section" aria-labelledby="contact-title">
      <SectionContainer>
        <SectionTitle id="contact-title">Contacto</SectionTitle>
        <p id="public-contact-status" className="editorial-note">Canales disponibles de {site.brandName}.</p>
        {site.contact.phone ? <p><a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a></p> : null}
        <ContactChannelItems links={publicContact(site.contact)} describedBy="public-contact-status" />
      </SectionContainer>
    </section>
  </>;
}

export function PublishedLanding({ content }: { content: PublicSite | null }) {
  const site = content?.site;
  if (!content || !site) return <section id="inicio" className="section" aria-labelledby="unavailable-title">
    <SectionContainer><h1 id="unavailable-title">Globows LM</h1>
      <p role="status">{content ? "El sitio aún no tiene contenido institucional publicado." : "El contenido no está disponible en este momento."}</p>
      <Link href="/blog">Visitar el blog</Link>
    </SectionContainer>
  </section>;
  return <>{hero(site)}{about(site)}{sections(content, site)}</>;
}
