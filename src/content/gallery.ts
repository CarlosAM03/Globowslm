import type { GalleryCategory, GalleryImage } from "@/types/content";

// Decoraciones y captions del preview aprobado; formación permanece separada por D05.
export const galleryCategories: readonly GalleryCategory[] = [
  { id: "baby-shower", label: "Baby Shower" },
  { id: "xv-anos", label: "XV años" },
  { id: "tematicas", label: "Decoraciones temáticas" },
];

export const galleryImages: readonly GalleryImage[] = [
  { id: "baby-shower-rosa", category: "baby-shower", title: "Decoración, sobremesa y centros de mesa. Baby Shower, 2026", src: "/images/gallery/baby-shower.webp", width: 472, height: 411, alt: "Decoración rosa al aire libre con globos, mariposas y letrero de Baby Shower.", approval: "approved" },
  { id: "xv-anos", category: "xv-anos", title: "Decoración para XV años", src: "/images/gallery/xv-anos.webp", width: 825, height: 555, alt: "Decoración de XV años con globos verdes y dorados, fondo brillante y números luminosos 15.", approval: "approved" },
  { id: "tematica-otono", category: "tematicas", title: "Kermés Día de la Cosecha. Tijuana, 2026", src: "/images/gallery/decoracion-tematica.webp", width: 827, height: 531, alt: "Montaje decorativo con globos naranjas, hojas de otoño y elementos de cosecha.", approval: "approved" },
  { id: "8-marzo", category: "tematicas", title: "8 de marzo de 2026 · Gimnasio Sparta 55", src: "/images/gallery/8-marzo.webp", width: 692, height: 749, alt: "Participantes del Gimnasio Sparta 55 junto a una decoración violeta de globos del 8 de marzo.", approval: "approved" },
];
