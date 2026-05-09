import { getPayloadClient } from '@/lib/payload'
import { ProjectDetail } from './project-detail'
import { notFound } from 'next/navigation'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  const doc = docs[0]
  if (!doc) notFound()

  const project = {
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    tech: (doc.tech ?? []).map((t: { name: string } | string) =>
      typeof t === 'object' ? t.name : t
    ),
    featured: doc.featured ?? false,
    github: doc.github ?? undefined,
    live: doc.live ?? undefined,
    metrics: (doc.metrics ?? []).map((m: { value: string } | string) =>
      typeof m === 'object' ? m.value : m
    ),
    content: doc.content,
    image: typeof doc.image === 'object' ? doc.image : null,
  }

  return <ProjectDetail project={project} />
}
