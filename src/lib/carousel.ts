export function getCarouselState(offset: number, width: number, total: number) {
  const maximum = Math.max(0, total - width);
  const position = Math.min(maximum, Math.max(0, offset));
  return { previous: position > 1, next: position < maximum - 1 };
}

export function getCarouselStep(cardWidth: number, gap: number, viewportWidth: number) {
  return cardWidth > 0 ? cardWidth + Math.max(0, gap) : viewportWidth;
}
