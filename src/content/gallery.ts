import type { GalleryCategory, GalleryImage } from "@/types/content";

// Classification describes visible decorations, without asserting clients or dates.
export const galleryCategories: readonly GalleryCategory[] = [
  { id: "baby-shower", label: "Baby Shower" },
  { id: "xv-anos", label: "XV años" },
  { id: "tematicas", label: "Decoraciones temáticas" },
];

export const galleryImages: readonly GalleryImage[] = [
  { id: "baby-shower-rosa", category: "baby-shower", title: "Detalles para una bienvenida", src: "/images/gallery/baby-shower.webp", width: 472, height: 411, alt: "Decoración rosa al aire libre con globos, mariposas y letrero de Baby Shower.", approval: "pending" },
  { id: "xv-anos-rosa", category: "xv-anos", title: "Una celebración de XV años", src: "/images/gallery/xv-anos.webp", width: 825, height: 555, alt: "Decoración de XV años con globos rosas, flores y números luminosos 15.", approval: "pending" },
  { id: "tematica-otono", category: "tematicas", title: "Colores de temporada", src: "/images/gallery/decoracion-tematica.webp", width: 827, height: 531, alt: "Montaje decorativo con globos naranjas, hojas de otoño y elementos de cosecha.", approval: "pending" },
];
