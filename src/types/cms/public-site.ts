import type { WhatsappInterest } from "@/lib/whatsapp";
import type { SitePayload } from "./content";
import type { PublicAsset } from "./public-blog";

export type Contact = SitePayload["contact"];
export type SiteView = Omit<SitePayload, "hero" | "about"> & {
  hero: { title: string; subtitle?: string; photo: PublicAsset | null };
  about: { title: string; history: string; philosophy?: string; portrait: PublicAsset | null };
};
export type Ordered<T> = { slug: string; position: number; data: T };
export type PublicSite = {
  site: SiteView | null;
  services: Ordered<{ title: string; description: string; ctaInterest: WhatsappInterest; image: PublicAsset | null; eventTypes: string[] }>[];
  eventTypes: Ordered<{ title: string; description?: string; image: PublicAsset | null }>[];
  categories: Ordered<{ title: string; description?: string }>[];
  galleries: Ordered<{ title: string; featured: boolean; category: string; photos: (PublicAsset & { caption?: string })[] }>[];
  training: Ordered<{ title: string; description: string; trainingType: string; ctaInterest: WhatsappInterest;
    photo: PublicAsset | null; video: PublicAsset | null }>[];
  certifications: Ordered<{ title: string; issuer: string; date?: string; description?: string; evidence: PublicAsset[] }>[];
};
