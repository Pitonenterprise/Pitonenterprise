import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { generateAltText, isAiEnabled } from '@/lib/ai'
import { resolveMediaDataUrl } from '@/lib/media-image'

export const maxDuration = 60

// Generates SEO alt text for one media image and saves it onto the media record.
export async function POST(req: Request) {
  const payload = await getPayloadClient()

  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }
  if (!isAiEnabled()) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 400 })
  }

  let body: { mediaId?: string | number; title?: string; fabric?: string; color?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!body.mediaId) return NextResponse.json({ error: 'mediaId required' }, { status: 400 })

  // Keyword-rich alt from known context — a strong SEO fallback when the image can't be loaded.
  const contextAlt = [body.color, body.title].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().slice(0, 125)

  try {
    const imageDataUrl = await resolveMediaDataUrl(payload, body.mediaId)
    // Best: vision + context (unique, keyword-anchored). Fallback: keyword alt from context.
    const alt = imageDataUrl
      ? await generateAltText({ imageDataUrl, title: body.title, fabric: body.fabric, color: body.color })
      : contextAlt
    const finalAlt = alt || contextAlt
    if (!finalAlt) return NextResponse.json({ error: 'No context to write alt' }, { status: 400 })
    await payload.update({ collection: 'media', id: body.mediaId, overrideAccess: true, data: { alt: finalAlt } })
    return NextResponse.json({ ok: true, alt: finalAlt, usedVision: !!imageDataUrl })
  } catch (err) {
    // Even if the vision call errors, save the context alt so the photo isn't left without one.
    if (contextAlt) {
      await payload.update({ collection: 'media', id: body.mediaId, overrideAccess: true, data: { alt: contextAlt } }).catch(() => {})
      return NextResponse.json({ ok: true, alt: contextAlt, usedVision: false })
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }
}
