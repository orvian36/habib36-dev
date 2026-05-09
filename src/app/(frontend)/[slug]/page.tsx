import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { findBySlug } from '@/lib/find-by-slug'
import { ProjectDetail } from '@/components/projects/project-detail'
import { BlogPostDetail } from '@/components/blog/blog-post-detail'
import type { Media } from '@/payload-types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await findBySlug(slug)
  if (!result) return {}

  const { doc } = result
  const meta = (doc as { meta?: { title?: string; description?: string; image?: Media | string | null } }).meta ?? {}
  const title = meta.title || doc.title
  const description =
    meta.description ||
    (result.type === 'post'
      ? (doc as { excerpt?: string }).excerpt
      : (doc as { description?: string }).description) ||
    ''

  const imageUrl =
    typeof meta.image === 'object' && meta.image && 'url' in meta.image && meta.image.url
      ? `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}${meta.image.url}`
      : undefined

  const url = `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/${slug}`

  return {
    title,
    description,
    openGraph: {
      type: result.type === 'post' ? 'article' : 'website',
      url,
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: { canonical: url },
  }
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await findBySlug(slug)
  if (!result) notFound()

  if (result.type === 'project') {
    const projectDoc = result.doc
    const project = {
      slug: projectDoc.slug,
      title: projectDoc.title,
      description: projectDoc.description,
      tech: (projectDoc.tech ?? []).map((t: { name: string } | string) =>
        typeof t === 'object' ? t.name : t
      ),
      featured: projectDoc.featured ?? false,
      github: projectDoc.github ?? undefined,
      live: projectDoc.live ?? undefined,
      metrics: (projectDoc.metrics ?? []).map((m: { value: string } | string) =>
        typeof m === 'object' ? m.value : m
      ),
      content: projectDoc.content,
      image: typeof projectDoc.image === 'object' ? projectDoc.image : null,
    }
    return <ProjectDetail project={project} />
  }

  const postDoc = result.doc
  const payload = await getPayloadClient()
  const { docs: relatedDocs } = await payload.find({
    collection: 'posts',
    where: {
      category: { equals: postDoc.category },
      slug: { not_equals: slug },
      _status: { equals: 'published' },
    },
    limit: 2,
  })

  const post = {
    slug: postDoc.slug,
    title: postDoc.title,
    excerpt: postDoc.excerpt,
    category: postDoc.category,
    tags: (postDoc.tags ?? []).map((t: { tag: string } | string) =>
      typeof t === 'object' ? t.tag : t
    ),
    date: postDoc.publishedAt ?? postDoc.createdAt,
    readingTime: postDoc.readingTime ?? '5 min',
    content: postDoc.content,
    image: typeof postDoc.image === 'object' ? postDoc.image : null,
  }

  const relatedPosts = relatedDocs.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
  }))

  return <BlogPostDetail post={post} relatedPosts={relatedPosts} />
}
