'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { StoreImage } from '@/lib/queries'

export function ProductGallery({
  images,
  accentColor,
  title,
}: {
  images: StoreImage[]
  accentColor?: string | null
  title: string
}) {
  const valid = images.filter(Boolean) as NonNullable<StoreImage>[]
  const [active, setActive] = useState(0)

  if (valid.length === 0) {
    return (
      <div
        className="aspect-[3/4] w-full rounded-sm"
        style={{ background: accentColor || 'linear-gradient(145deg,#6e1f3b,#4a1228)' }}
        role="img"
        aria-label={title}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-sm bg-line/40">
        <Image
          src={valid[active].url}
          alt={valid[active].alt || title}
          width={900}
          height={1200}
          priority
          className="aspect-[3/4] w-full object-cover"
        />
      </div>
      {valid.length > 1 && (
        <div className="flex gap-3">
          {valid.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-sm border ${
                i === active ? 'border-wine' : 'border-transparent'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img.url} alt="" width={80} height={107} className="aspect-[3/4] w-20 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
