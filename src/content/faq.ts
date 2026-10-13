// Respuestas del preview aprobado; digital se describe únicamente como evolución futura.
export type FaqItem = { question: string; answer: string };
export const faq: readonly FaqItem[] = [
  { question: "¿Con cuánta anticipación debo reservar?", answer: "Para grandes instalaciones y eventos corporativos, recomendamos reservar con 1–2 meses de anticipación. Para fiestas privadas, 2–4 semanas es ideal para garantizar la disponibilidad de colores y el tiempo de diseño." },
  { question: "¿Los cursos son para principiantes?", answer: "Nuestros talleres y cursos presenciales están diseñados para todos los niveles. Desde principiantes que buscan aprender técnicas básicas hasta profesionales que desean perfeccionar sus habilidades y explorar nuevas tendencias en decoración con globos. Igualmente contamos con clases personalizadas y mentorías para aquellos que buscan un enfoque más profundo y adaptado a sus necesidades específicas." },
  { question: "¿En dónde trabajan?", answer: "Nuestra sede principal de cursos y talleres se encuentra en Tijuana, Baja California, México. Contamos con alcance regional para decoraciones y eventos en los municipios cercanos. Estamos trabajando en expandir la capacitación y cursos al nivel digital para llegar a todo México y Latinoamérica; esta evolución no está disponible en la V1." },
] as const;
