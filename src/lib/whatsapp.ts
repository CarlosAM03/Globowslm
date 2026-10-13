export const whatsappMessages = {
  decoracion: "Hola, me gustaría recibir información sobre decoración para mi evento.",
  cursos: "Hola, me gustaría recibir información sobre los cursos presenciales de Globows LM.",
  talleres: "Hola, me gustaría recibir información sobre los talleres intensivos de Globows LM.",
  certificaciones: "Hola, me gustaría recibir información sobre la oferta de certificaciones de Globows LM.",
  asesorias: "Hola, me gustaría recibir información sobre las asesorías de Globows LM.",
  general: "Hola, me gustaría conocer más sobre Globows LM.",
} as const;

export type WhatsappInterest = keyof typeof whatsappMessages;

export function normalizeWhatsappNumber(number: string): string {
  const normalized = number.trim().replace(/[\s().-]/g, "").replace(/^\+/, "");
  if (!/^[1-9]\d{7,14}$/.test(normalized)) {
    throw new RangeError("El número de WhatsApp debe incluir código internacional y entre 8 y 15 dígitos.");
  }
  return normalized;
}

export function createWhatsappUrl(number: string | null, interest: WhatsappInterest): string | null {
  if (!number) return null;
  return `https://wa.me/${normalizeWhatsappNumber(number)}?text=${encodeURIComponent(whatsappMessages[interest])}`;
}
