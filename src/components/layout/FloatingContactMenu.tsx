import { getContactLinks } from "@/config/site";
import { FloatingContactPanel } from "./FloatingContactPanel";
import "./floating-contact.css";

export function FloatingContactMenu() {
  return <FloatingContactPanel links={getContactLinks()} />;
}
