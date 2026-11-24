import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/sections/hero/HeroSection";
import { AboutSection } from "@/components/sections/about/AboutSection";
import { ServicesEventsSection } from "@/components/sections/services-events/ServicesEventsSection";
import { GallerySection } from "@/components/sections/gallery/GallerySection";
import { CoursesSection } from "@/components/sections/courses/CoursesSection";
import { CertificationsSection } from "@/components/sections/certifications/CertificationsSection";
import { ContactSection } from "@/components/sections/contact/ContactSection";
import { TrustSupportSection } from "@/components/sections/trust-support/TrustSupportSection";
import { PublishedLanding } from "@/components/sections/PublishedLanding";
import { loadPublicSite } from "@/lib/cms/public-site";

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.CMS_BASELINE_FIXTURE === "1") return {};
  const result = await loadPublicSite();
  return { title: result?.site?.seo.title, description: result?.site?.seo.description, robots: { index: false, follow: false } };
}

async function CmsLanding() {
  return <PublishedLanding content={await loadPublicSite()} />;
}

export default function Home() {
  return <main id="contenido" tabIndex={-1}>
    {process.env.CMS_BASELINE_FIXTURE === "1" ?
      <><HeroSection /><AboutSection /><ServicesEventsSection /><GallerySection /><CoursesSection /><CertificationsSection /><TrustSupportSection /><ContactSection /></> :
      <Suspense fallback={<section className="hero section" aria-label="Contenido institucional"><p className="page-container" role="status">Cargando contenido…</p></section>}><CmsLanding /></Suspense>}
  </main>;
}
