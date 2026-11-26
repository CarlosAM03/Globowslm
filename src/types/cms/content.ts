export type CmsDraft<T> = {
  id: string;
  kind: string;
  slug: string;
  position: number;
  version: number;
  payload: T;
  state: "DRAFT" | "PUBLISHED" | "WITHDRAWN";
  archived: boolean;
  updatedAt: string;
};

export type CmsList<T> = { items: CmsDraft<T>[]; page: number; pageSize: number; total: number };

export type SitePayload = {
  brandName: string;
  founderName: string;
  hero: { title: string; subtitle?: string; photoRef?: string };
  about: { title: string; history: string; philosophy?: string; portraitRef?: string };
  trajectory?: string;
  contact: { email?: string; phone?: string; whatsapp?: string; facebook?: string; instagram?: string; tiktok?: string };
  faq: Array<{ question: string; answer: string }>;
  seo: { title: string; description: string };
};
