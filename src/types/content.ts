import type { WhatsappInterest } from "@/lib/whatsapp";

export type ContentImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  approval: "pending" | "approved";
};

export type Service = {
  id: string;
  name: string;
  description: string;
  interest: WhatsappInterest;
  contactLabel: string;
  image?: ContentImage;
  source: string;
};

export type GalleryImage = ContentImage & {
  id: string;
  title: string;
  category: string;
};

export type GalleryCategory = { id: string; label: string };
