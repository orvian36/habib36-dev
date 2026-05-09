import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'youtube',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Loom', value: 'loom' },
        { label: 'MP4 (direct URL)', value: 'mp4' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description:
          'YouTube: full watch URL or short URL. Loom: full share URL. MP4: direct file URL.',
      },
    },
    { name: 'caption', type: 'text' },
  ],
}
