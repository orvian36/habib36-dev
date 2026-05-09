import type { TextFieldValidation } from 'payload'

const RESERVED_SLUGS = new Set([
  'about',
  'admin',
  'api',
  'blog',
  'contact',
  'projects',
  'resume',
])

type Options = {
  /** The collection slug whose document is being validated. The opposite collection is the one we check against. */
  selfCollection: 'posts' | 'projects'
}

export const validateSharedSlug =
  ({ selfCollection }: Options): TextFieldValidation =>
  async (value, { req, id }) => {
    if (typeof value !== 'string' || value.length === 0) return true

    if (RESERVED_SLUGS.has(value)) {
      return `"${value}" is a reserved path and cannot be used as a slug.`
    }

    const otherCollection = selfCollection === 'posts' ? 'projects' : 'posts'

    const { totalDocs } = await req.payload.count({
      collection: otherCollection,
      where: { slug: { equals: value } },
    })

    if (totalDocs > 0) {
      return `Slug "${value}" already exists in ${otherCollection}. Slugs must be unique across posts and projects.`
    }

    // Same-collection uniqueness is already enforced by `unique: true` on the slug field,
    // so we don't re-check it here. The `id` argument exists so future logic can scope updates.
    void id

    return true
  }
