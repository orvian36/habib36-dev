import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Stat tiles', plural: 'Stat tile groups' },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Tile', plural: 'Tiles' },
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g. -47%, 3.2k, 99.9%' } },
        { name: 'label', type: 'text', required: true },
        {
          name: 'color',
          type: 'select',
          defaultValue: 'green',
          options: [
            { label: 'Green',  value: 'green' },
            { label: 'Blue',   value: 'blue' },
            { label: 'Purple', value: 'purple' },
            { label: 'Orange', value: 'orange' },
          ],
        },
      ],
    },
  ],
}
