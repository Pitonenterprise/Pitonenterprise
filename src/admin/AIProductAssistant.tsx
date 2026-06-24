'use client'

import { useState } from 'react'
import { useForm } from '@payloadcms/ui'

export function AIProductAssistant() {
  const { dispatchFields, getDataByPath, setModified } = useForm()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string[] | null>(null)
  const [inferred, setInferred] = useState<string[]>([])
  const [altStatus, setAltStatus] = useState<string | null>(null)

  // Generate keyword-anchored ALT text for every color photo (one vision call each).
  const generateAltForAllPhotos = async (title?: string, fabric?: string) => {
    const colors = (getDataByPath('colors') as any[]) || []
    const photos: { mediaId: string | number; color: string }[] = []
    for (const c of colors) {
      for (const img of (c?.images as any[]) || []) {
        const mid = img?.image && typeof img.image === 'object' ? img.image.id : img?.image
        if (mid != null) photos.push({ mediaId: mid, color: c?.name || '' })
      }
    }
    if (!photos.length) return
    setAltStatus(`Writing alt text for ${photos.length} photo(s)…`)
    const results = await Promise.all(
      photos.map((p) =>
        fetch('/api/ai/generate-alt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ mediaId: p.mediaId, color: p.color, title, fabric }),
        })
          .then((r) => r.ok)
          .catch(() => false),
      ),
    )
    setAltStatus(`Alt text written for ${results.filter(Boolean).length}/${photos.length} photo(s) ✓`)
  }

  const generate = async () => {
    setLoading(true)
    setError(null)
    setDone(null)
    setInferred([])
    setAltStatus(null)
    try {
      // First photo of the first color (the new unified Colors section).
      const mediaId = getDataByPath('colors.0.images.0.image') as string | number | undefined

      const res = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mediaId: mediaId ?? undefined, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      const l = data.listing as Record<string, any>
      const set = (path: string, value: unknown) => dispatchFields({ type: 'UPDATE', path, value })

      if (l.title) set('title', l.title)
      if (l.description) set('description', l.description)
      if (l.fabric) set('fabric', l.fabric)
      if (l.color) set('color', l.color)
      if (l.pattern) set('pattern', l.pattern)
      if (Array.isArray(l.occasions) && l.occasions.length) set('occasions', l.occasions)
      if (l.seoTitle) set('seo.metaTitle', l.seoTitle)
      if (l.seoDescription) set('seo.metaDescription', l.seoDescription)

      setModified(true)
      setDone(Array.isArray(l.keywords) ? l.keywords : [])
      setInferred(Array.isArray(l.inferred) ? l.inferred : [])

      // Then write SEO alt text for every color photo, using the new title/fabric for keywords.
      await generateAltForAllPhotos(l.title, l.fabric)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>✨</span>
        <strong style={{ fontSize: 14 }}>AI Listing Assistant</strong>
      </div>
      <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 10px' }}>
        Upload an image in the Images field below and/or jot rough notes. AI writes an
        SEO-optimized title, description, meta tags and attributes. Review before saving.
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Rough notes (optional): e.g. red banarasi silk saree, gold zari border, wedding"
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 6,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-text)',
          fontSize: 13,
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          style={{
            background: '#6e1f3b',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '8px 18px',
            fontSize: 13,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Generating…' : '✨ Generate with AI'}
        </button>
        {error && <span style={{ color: '#c0392b', fontSize: 12 }}>{error}</span>}
        {done && (
          <span style={{ color: '#1e7e45', fontSize: 12 }}>
            Fields filled ✓ — review &amp; save.
          </span>
        )}
      </div>
      {altStatus && (
        <p style={{ fontSize: 11, color: '#1e7e45', marginTop: 8 }}>{altStatus}</p>
      )}
      {inferred.length > 0 && (
        <p style={{ fontSize: 11, color: '#b8860b', marginTop: 8 }}>
          ⚠ AI guessed from the image (please verify): {inferred.join(', ')}
        </p>
      )}
      {done && done.length > 0 && (
        <p style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>
          Suggested keywords: {done.join(', ')}
        </p>
      )}
    </div>
  )
}
