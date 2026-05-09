// src/lib/article/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')      // strip punctuation
    .trim()
    .replace(/\s+/g, '-')              // spaces -> dashes
    .replace(/-+/g, '-')               // collapse runs of dashes
    .slice(0, 80)
}

/**
 * Returns a slugify function that disambiguates collisions by
 * appending -2, -3, ... on subsequent uses of the same base slug.
 */
export function makeUniqueSlugger() {
  const seen = new Map<string, number>()
  return (text: string): string => {
    const base = slugify(text) || 'section'
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }
}
