import { cache } from 'react'
import { getPayloadClient } from './payload'
import type { Post, Project } from '@/payload-types'

export type SlugDoc =
  | { type: 'project'; doc: Project }
  | { type: 'post'; doc: Post }
  | null

export const findBySlug = cache(async (slug: string): Promise<SlugDoc> => {
  const payload = await getPayloadClient()

  const [projectsRes, postsRes] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' },
      },
      depth: 2,
      limit: 1,
    }),
    payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' },
      },
      depth: 2,
      limit: 1,
    }),
  ])

  if (projectsRes.docs[0]) return { type: 'project', doc: projectsRes.docs[0] }
  if (postsRes.docs[0]) return { type: 'post', doc: postsRes.docs[0] }
  return null
})
