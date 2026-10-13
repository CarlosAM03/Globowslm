import { getContactLinks } from "@/config/site";
import { FloatingContactPanel } from "./FloatingContactPanel";

export function FloatingContactMenu() {
  return <FloatingContactPanel links={getContactLinks()} />;
}
