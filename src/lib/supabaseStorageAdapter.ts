import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'

// Custom Payload cloud-storage adapter for Supabase Storage, using the project's
// service-role key + the REST Storage API. Avoids needing separate S3 access keys.
// The target bucket must be PUBLIC so generated URLs are served by Supabase's CDN.
export function supabaseStorageAdapter(args: {
  bucket: string
  supabaseUrl: string
  serviceKey: string
}): Adapter {
  const { bucket, supabaseUrl, serviceKey } = args
  const base = `${supabaseUrl}/storage/v1`
  const keyFor = (prefix: string | undefined, filename: string) =>
    prefix ? `${prefix}/${filename}` : filename

  return ({ prefix: collectionPrefix }): GeneratedAdapter => ({
    name: 'supabase',

    generateURL: ({ filename, prefix }) =>
      `${base}/object/public/${bucket}/${keyFor(prefix ?? collectionPrefix, filename)}`,

    handleUpload: async ({ file, data }) => {
      const objectKey = keyFor(data?.prefix ?? collectionPrefix, file.filename)
      const res = await fetch(`${base}/object/${bucket}/${objectKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': file.mimeType || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: file.buffer as unknown as BodyInit,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Supabase Storage upload failed (${res.status}): ${text.slice(0, 200)}`)
      }
    },

    handleDelete: async ({ filename, doc }) => {
      const objectKey = keyFor((doc as { prefix?: string })?.prefix ?? collectionPrefix, filename)
      await fetch(`${base}/object/${bucket}/${objectKey}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${serviceKey}` },
      })
    },

    staticHandler: async (_req, { params }) => {
      const objectKey = keyFor(params.prefix ?? collectionPrefix, params.filename)
      const res = await fetch(`${base}/object/public/${bucket}/${objectKey}`)
      if (!res.ok || !res.body) return new Response(null, { status: 404 })
      return new Response(res.body, {
        status: 200,
        headers: {
          'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    },
  })
}
