import type { Block } from 'payload'

export const ImagePairBlock: Block = {
  slug: 'imagePair',
  interfaceName: 'ImagePairBlock',
  labels: { singular: 'Image pair', plural: 'Image pairs' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'left',
          type: 'group',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'label', type: 'text' },
          ],
        },
        {
          name: 'right',
          type: 'group',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'label', type: 'text' },
          ],
        },
      ],
    },
  ],
}
