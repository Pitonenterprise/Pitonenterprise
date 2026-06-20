import { NextResponse } from 'next/server'
import path from 'path'
import { readFile } from 'fs/promises'
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
      if (media?.filename) {
        const mime = media.mimeType || 'image/jpeg'
        let buf: Buffer | undefined

        if (media.url?.startsWith('http')) {
          // Remote storage (e.g. Supabase): fetch over the network.
          const imgRes = await fetch(media.url)
          if (imgRes.ok) buf = Buffer.from(await imgRes.arrayBuffer())
        } else {
          // Local disk storage: read directly (avoids unreliable loopback HTTP).
          const staticDir =
            (payload.collections?.media?.config?.upload as any)?.staticDir || 'media'
          const dir = path.isAbsolute(staticDir)
            ? staticDir
            : path.join(process.cwd(), staticDir)
          buf = await readFile(path.join(dir, media.filename))
        }

        if (buf) imageDataUrl = `data:${mime};base64,${buf.toString('base64')}`
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
