import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { ProjectDetail } from '@/components/projects/project-detail'
import { BlogPostDetail } from '@/components/blog/blog-post-detail'

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
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

  const projectDoc = projectsRes.docs[0]
  if (projectDoc) {
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

  const postDoc = postsRes.docs[0]
  if (postDoc) {
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

  notFound()
}
