import { HeroSection } from "@/components/sections/hero/HeroSection";
import { AboutSection } from "@/components/sections/about/AboutSection";
import { ServicesEventsSection } from "@/components/sections/services-events/ServicesEventsSection";
import { GallerySection } from "@/components/sections/gallery/GallerySection";
import { CoursesSection } from "@/components/sections/courses/CoursesSection";
import { CertificationsSection } from "@/components/sections/certifications/CertificationsSection";
import { ContactSection } from "@/components/sections/contact/ContactSection";

export default function Home() {
  return <main id="contenido" tabIndex={-1}><HeroSection /><AboutSection /><ServicesEventsSection /><GallerySection /><CoursesSection /><CertificationsSection /><ContactSection /></main>;
}
