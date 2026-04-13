import { getPayloadClient } from '@/lib/payload'
import { BlogPostDetail } from './blog-post-detail'
import { notFound } from 'next/navigation'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    limit: 1,
  })

  const doc = docs[0]
  if (!doc) notFound()

  // Get related posts (same category, exclude current)
  const { docs: relatedDocs } = await payload.find({
    collection: 'posts',
    where: {
      category: { equals: doc.category },
      slug: { not_equals: slug },
      _status: { equals: 'published' },
    },
    limit: 2,
  })

  const post = {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    tags: (doc.tags ?? []).map((t: { tag: string } | string) => (typeof t === 'object' ? t.tag : t)),
    date: doc.publishedAt ?? doc.createdAt,
    readingTime: doc.readingTime ?? '5 min',
  }

  const relatedPosts = relatedDocs.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
  }))

  return <BlogPostDetail post={post} relatedPosts={relatedPosts} />
}
