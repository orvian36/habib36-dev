import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const config = {
  matcher: ['/((?!api|admin|_next|_static|favicon.ico|robots.txt|sitemap.xml).*)'],
}

export const runtime = 'nodejs'

type CacheEntry = { to: string; type: '301' | '302' } | null
const cache = new Map<string, { value: CacheEntry; expires: number }>()
const TTL_MS = 60_000

async function lookupRedirect(pathname: string): Promise<CacheEntry> {
  const cached = cache.get(pathname)
  const now = Date.now()
  if (cached && cached.expires > now) return cached.value

  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'redirects',
      where: { from: { equals: pathname } },
      limit: 1,
      depth: 0,
    })
    const doc = res.docs[0] as
      | { to?: { url?: string }; type?: '301' | '302' }
      | undefined

    const value: CacheEntry =
      doc?.to?.url
        ? { to: doc.to.url, type: doc.type ?? '301' }
        : null

    cache.set(pathname, { value, expires: now + TTL_MS })
    return value
  } catch {
    return null
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const hit = await lookupRedirect(pathname)
  if (!hit) return NextResponse.next()

  const status = hit.type === '302' ? 302 : 301
  const target = new URL(hit.to + search, req.url)
  return NextResponse.redirect(target, status)
}
