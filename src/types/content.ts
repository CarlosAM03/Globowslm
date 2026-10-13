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

export type ContactChannelId = "whatsapp" | "facebook" | "instagram" | "tiktok" | "email";
export type ContactChannel = {
  id: ContactChannelId;
  label: string;
  status: "approved" | "candidate" | "missing";
  destination: string | null;
  source: string;
};
export type ContactLink = Pick<ContactChannel, "id" | "label" | "status"> & { href: string | null };

export type Certification = {
  id: string;
  name: string;
  organization?: string;
  date?: string;
  description?: string;
  image?: ContentImage;
  verified: boolean;
  verificationSource: string;
};
