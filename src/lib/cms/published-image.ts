export const publishedImageWidths = [320, 480, 640, 828, 1080, 1280] as const;

export function publishedImageWidth(value: string) {
  return publishedImageWidths.find((width) => String(width) === value);
}
