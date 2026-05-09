import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { SectionHeading } from '@/components/ui/section-heading'
import { SearchInput } from './search-client'

type SearchDoc = {
  id: string
  title: string
  slug: string
  excerpt?: string
  docType?: 'post' | 'project'
  category?: string | null
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  let results: SearchDoc[] = []
  if (query) {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'search',
      where: {
        or: [
          { title: { like: query } },
          { excerpt: { like: query } },
        ],
      },
      sort: '-priority',
      limit: 50,
      depth: 0,
    })
    results = res.docs as unknown as SearchDoc[]
  }

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <SectionHeading
          label="Search"
          title="Search the site"
          description="Find posts and projects by title or excerpt."
        />

        <div className="mb-10">
          <SearchInput />
        </div>

        {!query && (
          <p className="text-text-muted font-mono text-sm">
            Type to search across posts and projects.
          </p>
        )}

        {query && results.length === 0 && (
          <p className="text-text-muted font-mono text-sm">
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}

        {results.length > 0 && (
          <ul className="space-y-4">
            {results.map((r) => (
              <li key={r.id} className="card-surface p-5">
                <Link href={`/${r.slug}`} className="block group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-accent-blue">
                      {r.docType === 'post' ? 'Post' : 'Project'}
                    </span>
                    {r.category && (
                      <span className="font-mono text-xs text-text-muted">
                        · {r.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                    {r.title}
                  </h3>
                  {r.excerpt && (
                    <p className="text-sm text-text-secondary mt-1">{r.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
