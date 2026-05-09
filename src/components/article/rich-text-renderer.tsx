import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import { CalloutBlockComponent } from "@/blocks/callout/component";
import { DividerBlockComponent } from "@/blocks/divider/component";
import { ImageBlockComponent } from "@/blocks/image/component";
import { ImagePairBlockComponent } from "@/blocks/image-pair/component";
import { PullQuoteBlockComponent } from "@/blocks/pull-quote/component";
import { StatsBlockComponent } from "@/blocks/stats/component";
import { StepsBlockComponent } from "@/blocks/steps/component";
import { VideoBlockComponent } from "@/blocks/video/component";
import { makeUniqueSlugger } from "@/lib/article/slugify";

function getNodeText(node: unknown): string {
  if (!node) return "";
  if (typeof node === "object" && "text" in node && typeof (node as Record<string, unknown>).text === "string") {
    return (node as Record<string, string>).text;
  }
  if (typeof node === "object" && "children" in node && Array.isArray((node as Record<string, unknown>).children)) {
    return ((node as Record<string, unknown>).children as unknown[]).map(getNodeText).join("");
  }
  return "";
}

export function RichTextRenderer({
  content,
}: {
  content: SerializedEditorState;
}) {
  const sluggerForRender = makeUniqueSlugger();

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children });
      const id = sluggerForRender(getNodeText(node));
      const Tag = node.tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag id={id} data-heading-id={id}>
          {children}
        </Tag>
      );
    },
    blocks: {
      callout: ({ node }) => {
        const { variant, text } = node.fields as { variant: "info" | "success" | "warn" | "danger"; text: string };
        return <CalloutBlockComponent variant={variant} text={text} />;
      },
      divider: ({ node }) => {
        const { glyph, label } = node.fields as { glyph?: string | null; label?: string | null };
        return <DividerBlockComponent glyph={glyph} label={label} />;
      },
      image: ({ node }) => {
        const fields = node.fields as { image: { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } | string | null; alt?: string | null; caption?: string | null };
        return <ImageBlockComponent image={fields.image} alt={fields.alt} caption={fields.caption} />;
      },
      imagePair: ({ node }) => {
        const fields = node.fields as { left: { image: { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } | string | null; label?: string | null }; right: { image: { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } | string | null; label?: string | null } };
        return <ImagePairBlockComponent left={fields.left} right={fields.right} />;
      },
      pullQuote: ({ node }) => {
        const { quote, cite } = node.fields as { quote: string; cite?: string | null };
        return <PullQuoteBlockComponent quote={quote} cite={cite} />;
      },
      stats: ({ node }) => {
        const { items } = node.fields as { items: { value: string; label: string; color?: string }[] };
        return <StatsBlockComponent items={items} />;
      },
      steps: ({ node }) => {
        const { items } = node.fields as { items: { title: string; body?: string | null }[] };
        return <StepsBlockComponent items={items} />;
      },
      video: ({ node }) => {
        const { provider, url, caption } = node.fields as { provider: "youtube" | "loom" | "mp4"; url: string; caption?: string | null };
        return <VideoBlockComponent provider={provider} url={url} caption={caption} />;
      },
    },
  });

  return (
    <RichText
      data={content}
      converters={converters}
      disableContainer
      className="prose-article"
    />
  );
}
