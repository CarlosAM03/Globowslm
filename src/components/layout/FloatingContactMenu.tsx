import type { ContactLink } from "@/types/content";
import { getContactLinks } from "@/config/site";
import { FloatingContactPanel } from "./FloatingContactPanel";

export function FloatingContactMenu({ links = getContactLinks() }: { links?: readonly ContactLink[] }) {
  return <FloatingContactPanel links={links} />;
}
