type Provider = "youtube" | "loom" | "mp4";

function youtubeId(url: string): string | null {
  const m =
    url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function loomEmbed(url: string): string | null {
  const m = url.match(/loom\.com\/share\/([A-Za-z0-9]+)/);
  return m ? `https://www.loom.com/embed/${m[1]}` : null;
}

export function VideoBlockComponent({
  provider,
  url,
  caption,
}: {
  provider: Provider;
  url: string;
  caption?: string | null;
}) {
  let embed: { kind: "iframe" | "video"; src: string } | null = null;

  if (provider === "youtube") {
    const id = youtubeId(url);
    embed = id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
  } else if (provider === "loom") {
    const src = loomEmbed(url);
    embed = src ? { kind: "iframe", src } : null;
  } else if (provider === "mp4") {
    embed = { kind: "video", src: url };
  }

  if (!embed) {
    return (
      <div className="my-8 p-4 card-surface text-sm text-text-muted font-mono">
        Could not parse video URL: {url}
      </div>
    );
  }

  return (
    <figure className="my-8">
      <div className="rounded-xl overflow-hidden border border-border-primary bg-black aspect-video">
        {embed.kind === "iframe" ? (
          <iframe
            src={embed.src}
            title={caption ?? "Embedded video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="w-full h-full"
          />
        ) : (
          <video
            src={embed.src}
            controls
            preload="metadata"
            className="w-full h-full"
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center font-mono text-xs text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
