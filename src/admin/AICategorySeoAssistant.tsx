'use client'

import { useState } from 'react'
import { useForm } from '@payloadcms/ui'

// Generates SEO meta title + meta description from the category title.
export function AICategorySeoAssistant() {
  const { dispatchFields, getDataByPath, setModified } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setDone(false)
    try {
      const title = (getDataByPath('title') as string | undefined)?.trim()
      if (!title) throw new Error('Enter a title first.')

      const res = await fetch('/api/ai/generate-category-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, kind: 'category' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      const set = (path: string, value: unknown) => dispatchFields({ type: 'UPDATE', path, value })
      if (data.metaTitle) set('seo.metaTitle', data.metaTitle)
      if (data.metaDescription) set('seo.metaDescription', data.metaDescription)
      setModified(true)
      setDone(true)
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
        padding: 14,
        marginBottom: 20,
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 13 }}>✨ AI SEO</strong>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          Generate the meta title &amp; description (hidden from shoppers, used for search).
        </span>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            background: '#6e1f3b',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '7px 16px',
            fontSize: 12,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Generating…' : 'Generate SEO'}
        </button>
      </div>
      {error && <p style={{ color: '#c0392b', fontSize: 12, margin: '8px 0 0' }}>{error}</p>}
      {done && <p style={{ color: '#1e7e45', fontSize: 12, margin: '8px 0 0' }}>SEO meta filled ✓ (in the SEO panel) — review &amp; save.</p>}
    </div>
  )
}
