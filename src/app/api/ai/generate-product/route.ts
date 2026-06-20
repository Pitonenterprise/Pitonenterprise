import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { generateProductListing, isAiEnabled } from '@/lib/ai'

export const maxDuration = 60

export async function POST(req: Request) {
  const payload = await getPayloadClient()

  // Admins/staff only.
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }
  if (!isAiEnabled()) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server.' }, { status: 400 })
  }

  let body: { mediaId?: string | number; notes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Resolve the uploaded image (if any) to a base64 data URL for OpenAI vision.
  let imageDataUrl: string | undefined
  if (body.mediaId) {
    try {
      const media: any = await payload.findByID({
        collection: 'media',
        id: body.mediaId,
        overrideAccess: true,
      })
      if (media?.url) {
        const origin = new URL(req.url).origin
        const absolute = media.url.startsWith('http') ? media.url : `${origin}${media.url}`
        const imgRes = await fetch(absolute)
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer())
          const mime = media.mimeType || 'image/jpeg'
          imageDataUrl = `data:${mime};base64,${buf.toString('base64')}`
        }
      }
    } catch {
      // Non-fatal: fall back to notes-only generation.
    }
  }

  if (!imageDataUrl && !body.notes?.trim()) {
    return NextResponse.json(
      { error: 'Add an image or some notes first, then generate.' },
      { status: 400 },
    )
  }

  try {
    const listing = await generateProductListing({ notes: body.notes, imageDataUrl })
    return NextResponse.json({ ok: true, listing })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }
}
