import type { Certification } from "../types/content";

export function getVerifiedCertifications(entries: readonly Certification[]): readonly Certification[] {
  return entries.filter((entry) => entry.verified && entry.id.trim() && entry.name.trim() && entry.verificationSource.trim());
}

export function getTimelineScrollState(scrollLeft: number, clientWidth: number, scrollWidth: number) {
  const maximum = Math.max(0, scrollWidth - clientWidth);
  return { previous: scrollLeft > 1, next: scrollLeft < maximum - 1 };
}

export function getTimelineScrollDistance(cardWidth: number, gap: number, viewportWidth: number) {
  return cardWidth > 0 ? cardWidth + gap : viewportWidth;
}
