import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { generateCategorySeo, isAiEnabled } from '@/lib/ai'

export const maxDuration = 60

// Generates SEO meta title + meta description for a category/collection page.
export async function POST(req: Request) {
  const payload = await getPayloadClient()

  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }
  if (!isAiEnabled()) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 400 })
  }

  let body: { title?: string; kind?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Enter a title first, then generate.' }, { status: 400 })
  }

  try {
    const seo = await generateCategorySeo({ title: body.title, kind: body.kind })
    return NextResponse.json({ ok: true, ...seo })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }
}
