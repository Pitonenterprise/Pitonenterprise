'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

export function SortSelect({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString())
    next.set('sort', value)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <label className="flex items-center gap-2 text-[12px] uppercase tracking-[1.5px] text-muted">
      Sort
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="border-b border-foreground/20 bg-transparent py-1 text-foreground focus:border-wine"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
