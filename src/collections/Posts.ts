import type { CollectionConfig } from 'payload'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { blocks } from '@/blocks'
import { validateSharedSlug } from '@/lib/slug-validation'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      validate: validateSharedSlug({ selfCollection: 'posts' }),
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      label: 'Short Description',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Post Content',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks }),
        ],
      }),
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Deep Technical', value: 'Deep Technical' },
        { label: 'Tutorial', value: 'Tutorial' },
        { label: 'Career', value: 'Career' },
        { label: 'Opinion', value: 'Opinion' },
        { label: 'Project Breakdown', value: 'Project Breakdown' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'readingTime',
      type: 'text',
      label: 'Reading Time',
      admin: {
        position: 'sidebar',
        description: 'e.g. "8 min"',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },
  ],
}
