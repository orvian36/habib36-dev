import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import { DividerBlockComponent } from "@/blocks/divider/component";
import { makeUniqueSlugger } from "@/lib/article/slugify";

function getNodeText(node: any): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(getNodeText).join("");
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
      divider: ({ node }) => (
        <DividerBlockComponent {...(node.fields as any)} />
      ),
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
