'use client'

import { useState } from 'react'
import { useForm } from '@payloadcms/ui'

// Convert plain text into a minimal Lexical editor state for the `description` richText field.
function textToLexical(text: string) {
  const paragraphs = text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
  const children = (paragraphs.length ? paragraphs : ['']).map((p) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: p, version: 1 }],
  }))
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}

export function AIProductAssistant() {
  const { dispatchFields, getDataByPath, setModified } = useForm()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string[] | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setDone(null)
    try {
      const mediaId = getDataByPath('images.0.image') as string | number | undefined

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
      if (l.description) set('description', textToLexical(l.description))
      if (l.fabric) set('fabric', l.fabric)
      if (l.color) set('color', l.color)
      if (l.pattern) set('pattern', l.pattern)
      if (l.badge) set('badge', l.badge)
      if (Array.isArray(l.occasions) && l.occasions.length) set('occasions', l.occasions)
      if (l.seoTitle) set('seo.metaTitle', l.seoTitle)
      if (l.seoDescription) set('seo.metaDescription', l.seoDescription)

      setModified(true)
      setDone(Array.isArray(l.keywords) ? l.keywords : [])
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
      {done && done.length > 0 && (
        <p style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>
          Suggested keywords: {done.join(', ')}
        </p>
      )}
    </div>
  )
}
