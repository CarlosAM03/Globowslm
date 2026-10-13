import { HeroSection } from "@/components/sections/hero/HeroSection";
import { AboutSection } from "@/components/sections/about/AboutSection";

export default function Home() {
  return <main id="contenido" tabIndex={-1}><HeroSection /><AboutSection /></main>;
}
