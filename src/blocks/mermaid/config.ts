import type { Block } from 'payload'

export const MermaidBlock: Block = {
  slug: 'mermaid',
  interfaceName: 'MermaidBlock',
  labels: { singular: 'Mermaid diagram', plural: 'Mermaid diagrams' },
  fields: [
    {
      name: 'source',
      type: 'code',
      required: true,
      admin: { description: 'Mermaid syntax (e.g. graph LR; A-->B).' },
    },
  ],
}
