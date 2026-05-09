import type { Block } from 'payload'

export const DividerBlock: Block = {
  slug: 'divider',
  interfaceName: 'DividerBlock',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [
    {
      name: 'glyph',
      type: 'text',
      label: 'Glyph',
      defaultValue: '§',
      admin: { description: 'Optional glyph shown in the middle of the rule.' },
    },
    {
      name: 'label',
      type: 'text',
      label: 'Label',
      admin: { description: 'Optional small label shown in the middle.' },
    },
  ],
}
