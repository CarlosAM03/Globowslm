"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHorizontalCarousel } from "@/hooks/useHorizontalCarousel";
import type { GalleryCategory, GalleryImage } from "@/types/content";

export function GalleryGrid({ categories, images }: { categories: readonly GalleryCategory[]; images: readonly GalleryImage[] }) {
  const [selected, setSelected] = useState("all");
  const { viewport, available, move, onKeyDown } = useHorizontalCarousel(selected);
  const availableCategories = categories.filter((category) => images.some((image) => image.category === category.id));
  const visibleImages = selected === "all" ? images : images.filter((image) => image.category === selected);

  if (images.length === 0) return <p className="editorial-note">El portafolio estará disponible cuando existan fotografías validadas.</p>;

  return (
    <>
      <div className="gallery-filters" role="group" aria-label="Filtrar decoraciones por categoría">
        {[{ id: "all", label: "Todas" }, ...availableCategories].map((category) => <button key={category.id} type="button" aria-pressed={selected === category.id} aria-controls="gallery-results" onClick={() => setSelected(category.id)}>{category.label}</button>)}
      </div>
      <p className="gallery-count" role="status" aria-live="polite" aria-atomic="true">{visibleImages.length} {visibleImages.length === 1 ? "decoración" : "decoraciones"} · {selected === "all" ? "Todas las categorías" : categories.find((category) => category.id === selected)?.label}</p>
      <div className="gallery-navigation" role="group" aria-label="Navegar por fotografías">
        <button type="button" aria-label="Fotografía anterior" aria-controls="gallery-results" disabled={!available.previous} onClick={() => move(-1)}><ChevronLeft aria-hidden="true" strokeWidth={1.75} /></button>
        <button type="button" aria-label="Fotografía siguiente" aria-controls="gallery-results" disabled={!available.next} onClick={() => move(1)}><ChevronRight aria-hidden="true" strokeWidth={1.75} /></button>
      </div>
      <div ref={viewport} id="gallery-results" className="gallery-viewport" role="region" aria-roledescription="carrusel" aria-label="Portafolio de decoraciones" tabIndex={0} onKeyDown={onKeyDown}>
        <div className="gallery-track">
        {visibleImages.map((image) => <figure key={image.id} className="gallery-card" data-category={image.category}>
          <div className="gallery-image"><Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes="(min-width: 1440px) 405px, (min-width: 1024px) calc((100vw - 224px) / 3), (min-width: 768px) calc((100vw - 128px) / 2), calc(100vw - 48px)" /></div>
          <figcaption><span>{categories.find((category) => category.id === image.category)?.label}</span><strong>{image.title}</strong></figcaption>
        </figure>)}
        </div>
      </div>
    </>
  );
}
