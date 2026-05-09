import NextImage from "next/image";

type Media = { url?: string | null; alt?: string | null; width?: number | null; height?: number | null };

export function ImageBlockComponent({
  image,
  alt,
  caption,
}: {
  image: Media | string | null;
  alt?: string | null;
  caption?: string | null;
}) {
  if (!image || typeof image === "string" || !image.url) return null;
  const altText = alt ?? image.alt ?? "";
  return (
    <figure className="my-8">
      <div className="rounded-xl border border-border-primary overflow-hidden bg-bg-tertiary">
        <NextImage
          src={image.url}
          alt={altText}
          width={image.width ?? 1600}
          height={image.height ?? 900}
          className="w-full h-auto"
          sizes="(min-width: 768px) 640px, 100vw"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center font-mono text-xs text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
