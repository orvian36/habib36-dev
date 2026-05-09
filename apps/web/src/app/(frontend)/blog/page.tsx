import { getPayloadClient } from '@/lib/payload'
import { BlogGrid } from './blog-grid'

export default async function BlogPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    limit: 100,
    sort: '-publishedAt',
  })

  const posts = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    tags: (doc.tags ?? []).map((t: { tag: string } | string) => (typeof t === 'object' ? t.tag : t)),
    date: doc.publishedAt ?? doc.createdAt,
    readingTime: doc.readingTime ?? '5 min',
  }))

  return <BlogGrid posts={posts} />
}
