import Image, { type ImageProps } from "next/image";
import { publishedImageWidths } from "@/lib/cms/published-image";

type Props = Omit<ImageProps, "src" | "unoptimized"> & { src: string };

export function PublishedImage({ src, sizes = "100vw", ...props }: Props) {
  if (!src.startsWith("/api/cms/public/media/")) return <Image {...props} src={src} sizes={sizes} />;
  const srcSet = publishedImageWidths.map((width) => `${src}?width=${width} ${width}w`).join(", ");
  return <picture className="published-picture">
    <source type="image/webp" srcSet={srcSet} sizes={sizes} />
    <Image {...props} src={src} sizes={sizes} unoptimized />
  </picture>;
}
