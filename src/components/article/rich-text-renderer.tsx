import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import { CalloutBlockComponent } from "@/blocks/callout/component";
import { DividerBlockComponent } from "@/blocks/divider/component";
import { PullQuoteBlockComponent } from "@/blocks/pull-quote/component";
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
      pullQuote: ({ node }) => {
        const { quote, cite } = node.fields as { quote: string; cite?: string | null };
        return <PullQuoteBlockComponent quote={quote} cite={cite} />;
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
