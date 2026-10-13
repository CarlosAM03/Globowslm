import { HeroSection } from "@/components/sections/hero/HeroSection";
import { AboutSection } from "@/components/sections/about/AboutSection";
import { ServicesEventsSection } from "@/components/sections/services-events/ServicesEventsSection";
import { GallerySection } from "@/components/sections/gallery/GallerySection";

export default function Home() {
  return <main id="contenido" tabIndex={-1}><HeroSection /><AboutSection /><ServicesEventsSection /><GallerySection /></main>;
}
