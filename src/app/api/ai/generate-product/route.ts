import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { generateProductListing, isAiEnabled } from '@/lib/ai'
import { resolveMediaDataUrl } from '@/lib/media-image'

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
  const imageDataUrl = body.mediaId ? await resolveMediaDataUrl(payload, body.mediaId) : undefined

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
