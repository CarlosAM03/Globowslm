import type { ContentKind } from "@/lib/cms/content-path";
import type { CmsDraft } from "./content";

export const publicationStates = ["DRAFT", "PUBLISHED", "WITHDRAWN"] as const;
export type PublicationState = typeof publicationStates[number];

export type Publication = Omit<CmsDraft<unknown>, "kind" | "payload"> & {
  kind: Uppercase<ContentKind>;
  title: string;
};
export type PageOf<T> = { items: T[]; page: number; pageSize: number; total: number };
export type Revision = {
  revisionNo: number;
  slug: string;
  position: number;
  publishedAt: string;
  actorId: string;
  active: boolean;
};
export type RevisionDetail = Revision & { payload: object };
