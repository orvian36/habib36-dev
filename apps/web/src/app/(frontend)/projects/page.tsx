import { getPayloadClient } from '@/lib/payload'
import { ProjectsGrid } from './projects-grid'

export default async function ProjectsPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: { _status: { equals: 'published' } },
    limit: 100,
    sort: '-createdAt',
  })

  const projects = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    tech: (doc.tech ?? []).map((t: { name: string } | string) => (typeof t === 'object' ? t.name : t)),
    featured: doc.featured ?? false,
    github: doc.github ?? undefined,
    live: doc.live ?? undefined,
    metrics: (doc.metrics ?? []).map((m: { value: string } | string) => (typeof m === 'object' ? m.value : m)),
  }))

  return <ProjectsGrid projects={projects} />
}
