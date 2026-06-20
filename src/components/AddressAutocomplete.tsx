'use client'

import { useEffect, useRef, useState } from 'react'

export type AddressSuggestion = {
  label: string
  line1: string
  city: string
  state: string
  postalCode: string
  country: string
}

export function AddressAutocomplete({
  onSelect,
  className = '',
}: {
  onSelect: (a: AddressSuggestion) => void
  className?: string
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Debounced lookup.
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/address/suggest?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const pick = (s: AddressSuggestion) => {
    onSelect(s)
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        placeholder="🔍 Start typing your address…"
        autoComplete="off"
        className="h-12 w-full rounded-sm border border-foreground/20 bg-white/50 px-4 text-sm focus:border-wine"
      />
      {open && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-sm border border-line bg-background shadow-lg">
          {loading && suggestions.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">Searching…</li>
          )}
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => pick(s)}
                className="block w-full px-4 py-2.5 text-left text-sm text-foreground transition hover:bg-gold-soft/30"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-[11px] text-muted">Pick a suggestion to auto-fill, or enter your address manually below.</p>
    </div>
  )
}
