import type { Service } from "@/types/content";
import { heroContent } from "@/content/institutional";

// ERV1 §4 «Servicios»: photos and contact require commercial approval.
export const services: readonly Service[] = [
  { id: "decoraciones", name: "Decoraciones profesionales", description: "Decoración con globos para acompañar celebraciones y eventos con una propuesta visual cuidada.", interest: "decoracion", contactLabel: "Consultar decoración", image: heroContent.image, source: "ERV1 §4 «Servicios» · Brand Discovery §4" },
  { id: "cursos", name: "Cursos presenciales", description: "Formación presencial en decoración con globos, dirigida a quienes desean aprender y desarrollar sus habilidades.", interest: "cursos", contactLabel: "Consultar cursos", source: "ERV1 §4 «Servicios»" },
  { id: "talleres", name: "Talleres intensivos", description: "Espacios de aprendizaje práctico para profundizar en técnicas de decoración con globos.", interest: "talleres", contactLabel: "Consultar talleres", source: "ERV1 §4 «Servicios»" },
  { id: "certificaciones", name: "Certificaciones", description: "Información y orientación sobre las propuestas de certificación vinculadas a la formación profesional.", interest: "certificaciones", contactLabel: "Consultar certificaciones", source: "ERV1 §4 «Servicios» y «Certificaciones»" },
  { id: "asesorias", name: "Asesorías", description: "Orientación personalizada para resolver dudas sobre decoración con globos y desarrollo profesional.", interest: "asesorias", contactLabel: "Consultar asesorías", source: "ERV1 §4 «Servicios»" },
];
