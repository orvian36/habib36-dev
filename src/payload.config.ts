import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import * as Sentry from '@sentry/nextjs'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Posts } from './collections/Posts'
import { Notification } from './globals/Notification'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects, Posts],
  globals: [Notification],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'super-secret-key-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@habib36.dev',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'habib36.dev',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  plugins: [
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        message: true,
        checkbox: true,
        number: true,
        payment: false,
      },
      formOverrides: {
        admin: { group: 'Forms' },
      },
      formSubmissionOverrides: {
        admin: { group: 'Forms' },
      },
      defaultToEmail: process.env.EMAIL_FROM_ADDRESS,
    }),
    seoPlugin({
      collections: ['posts', 'projects'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${(doc as { title?: string })?.title ?? ''} | habib36.dev`,
      generateDescription: ({ doc }) => {
        const d = doc as { excerpt?: string; description?: string }
        return d?.excerpt ?? d?.description ?? ''
      },
      generateURL: ({ doc }) => {
        const slug = (doc as { slug?: string })?.slug ?? ''
        return `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/${slug}`
      },
      tabbedUI: true,
    }),
    redirectsPlugin({
      collections: ['posts', 'projects'],
      overrides: {
        admin: { group: 'System' },
      },
      redirectTypes: ['301', '302'],
    }),
    searchPlugin({
      collections: ['posts', 'projects'],
      defaultPriorities: { posts: 10, projects: 20 },
      searchOverrides: {
        admin: { group: 'System' },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'excerpt', type: 'textarea' },
          { name: 'category', type: 'text' },
          {
            name: 'docType',
            type: 'select',
            options: [
              { label: 'Post', value: 'post' },
              { label: 'Project', value: 'project' },
            ],
          },
        ],
      },
      beforeSync: ({ originalDoc, searchDoc }) => {
        const isPost = 'excerpt' in originalDoc && 'category' in originalDoc
        return {
          ...searchDoc,
          excerpt: (originalDoc as { excerpt?: string; description?: string }).excerpt
            ?? (originalDoc as { description?: string }).description
            ?? '',
          category: (originalDoc as { category?: string }).category ?? null,
          docType: isPost ? 'post' : 'project',
        }
      },
      syncDrafts: false,
    }),
    sentryPlugin({ Sentry }),
  ],
  sharp,
})
