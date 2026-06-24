import path from 'path'
import { readFile } from 'fs/promises'
import type { Payload } from 'payload'

// Resolve a Media id to a base64 data URL for OpenAI vision (server-only).
export async function resolveMediaDataUrl(
  payload: Payload,
  mediaId: string | number,
): Promise<string | undefined> {
  try {
    const media: any = await payload.findByID({ collection: 'media', id: mediaId, overrideAccess: true })
    if (!media?.filename) return undefined
    const mime = media.mimeType || 'image/jpeg'
    let buf: Buffer | undefined

    // 1) Fetch the media URL. Absolute (e.g. Supabase CDN) is used as-is; a relative
    //    `/api/media/file/...` is resolved against the site origin (served from Supabase).
    if (media.url) {
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      const url = media.url.startsWith('http') ? media.url : `${base}${media.url}`
      try {
        const r = await fetch(url)
        if (r.ok) buf = Buffer.from(await r.arrayBuffer())
      } catch {
        /* fall through to disk */
      }
    }

    // 2) Fallback: read from local disk (local-only storage).
    if (!buf) {
      try {
        const staticDir = (payload.collections?.media?.config?.upload as any)?.staticDir || 'media'
        const dir = path.isAbsolute(staticDir) ? staticDir : path.join(process.cwd(), staticDir)
        buf = await readFile(path.join(dir, media.filename))
      } catch {
        /* no local copy */
      }
    }

    return buf ? `data:${mime};base64,${buf.toString('base64')}` : undefined
  } catch {
    return undefined
  }
}
