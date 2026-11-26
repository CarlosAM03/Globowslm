import type { Service } from "@/types/content";

export function v1ServiceRecords(services: readonly Service[], mediaBySource: ReadonlyMap<string, string>) {
  return services.map((service, position) => {
    const image = service.image?.approval === "approved" ? service.image : undefined;
    const imageRef = image ? mediaBySource.get(image.src) : undefined;
    if (image && !imageRef) throw new Error(`Falta el derivado aprobado de ${service.id}.`);
    return {
      sourceKey: `v1:service:${service.id}`,
      source: service.source,
      slug: service.id,
      position,
      payload: {
        title: service.name,
        description: service.description,
        ctaInterest: service.interest,
        eventTypes: [],
        ...(imageRef && { imageRef }),
      },
    };
  });
}
