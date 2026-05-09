import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image',   type: 'upload', relationTo: 'media', required: true },
    { name: 'alt',     type: 'text',   admin: { description: 'Falls back to media alt if empty.' } },
    { name: 'caption', type: 'text' },
  ],
}
