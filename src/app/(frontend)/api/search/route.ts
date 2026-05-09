import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const docType = req.nextUrl.searchParams.get('docType')

  if (!q) return NextResponse.json({ docs: [] })

  try {
    const payload = await getPayloadClient()
    const where: Record<string, unknown> = {
      or: [
        { title: { like: q } },
        { excerpt: { like: q } },
      ],
    }
    if (docType === 'post' || docType === 'project') {
      where.and = [{ docType: { equals: docType } }]
    }

    const res = await payload.find({
      collection: 'search',
      where,
      sort: '-priority',
      limit: 50,
      depth: 0,
    })

    return NextResponse.json({ docs: res.docs })
  } catch (err) {
    return NextResponse.json(
      { docs: [], error: String(err) },
      { status: 500 },
    )
  }
}
