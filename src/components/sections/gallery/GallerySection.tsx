import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { galleryCategories, galleryImages } from "@/content/gallery";
import { GalleryGrid } from "./GalleryGrid";
import "./gallery.css";

export function GallerySection() {
  return (
    <section id="galeria" className="section gallery-section" aria-labelledby="gallery-title">
      <SectionContainer>
        <SectionTitle id="gallery-title" eyebrow="Galería de decoraciones" description="Explora composiciones reales del archivo visual de Globows LM, organizadas por la ocasión que muestran.">Cada detalle cuenta una historia.</SectionTitle>
        <p className="editorial-note gallery-editorial">Selección de desarrollo. La autorización de publicación comercial de estas fotografías está pendiente.</p>
        <GalleryGrid categories={galleryCategories} images={galleryImages} />
      </SectionContainer>
    </section>
  );
}
