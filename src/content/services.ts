import type { Service } from "@/types/content";
import { trainingContent } from "@/content/training";
import { heroContent, aboutContent } from "@/content/institutional";

// Catálogo ERV1 con copy/recursos del preview aprobado. Fotos ilustrativas no acreditan certificaciones.
export const services: readonly Service[] = [
  { id: "decoraciones", name: "Decoraciones profesionales", description: "Instalaciones escultóricas a medida para eventos corporativos, bodas, fiestas de cumpleaños o cualquier otro evento especial.", interest: "decoracion", contactLabel: "Consultar decoración", image: heroContent.image, source: "ERV1 §4 «Servicios» · Brand Discovery §4" },
  { id: "cursos", name: "Cursos presenciales", description: "Plan de estudios integral presencial diseñado para aspirantes a profesionales que buscan maestría técnica o iniciar en el mundo del arte con globos.", interest: "cursos", contactLabel: "Consultar cursos", image: trainingContent.image, source: "ERV1 §4 «Servicios»" },
  { id: "talleres", name: "Talleres intensivos", description: "Talleres semanales dedicados a desarrollar habilidades prácticas en diseño y creación de arte con globos.", interest: "talleres", contactLabel: "Consultar talleres", image: trainingContent.image, source: "ERV1 §4 «Servicios»" },
  { id: "certificaciones", name: "Certificaciones", description: "Información y orientación sobre las propuestas de certificación vinculadas a la formación profesional.", interest: "certificaciones", contactLabel: "Consultar certificaciones", source: "ERV1 §4 «Servicios» y «Certificaciones»" },
  { id: "asesorias", name: "Asesorías", description: "Orientación personalizada para resolver dudas sobre decoración con globos y desarrollo profesional.", interest: "asesorias", contactLabel: "Consultar asesorías", image: aboutContent.image, source: "ERV1 §4 «Servicios»" },
];
