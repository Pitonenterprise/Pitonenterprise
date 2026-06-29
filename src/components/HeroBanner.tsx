'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

type Slide = { url: string; alt: string }

// Full-width banner carousel: slides move horizontally, auto-advancing.
// Images come from Admin → Settings → Hero Images.
export function HeroBanner({
  images,
  intervalMs = 4500,
}: {
  images: Slide[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const count = images.length

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count],
  )

  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(id)
  }, [count, intervalMs])

  // No images uploaded yet — show a branded placeholder so the page isn't empty.
  if (count === 0) {
    return (
      <section
        className="flex h-[260px] w-full items-center justify-center sm:h-[360px] md:h-[460px]"
        style={{ background: 'linear-gradient(150deg,#6e1f3b,#4a1228)' }}
      >
        <div className="text-center text-gold-soft">
          <p className="text-[11px] uppercase tracking-[4px] text-gold">Piton Enterprise</p>
          <p className="mt-2 font-display text-3xl text-white md:text-4xl">
            Where tradition meets timeless beauty
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full overflow-hidden bg-line/30">
      {/* Sliding track */}
      <div
        className="flex h-[260px] transition-transform duration-700 ease-out sm:h-[380px] md:h-[520px] lg:h-[600px]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={img.url} className="relative h-full w-full shrink-0">
            <Image
              src={img.url}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          {/* Arrows */}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-wine shadow-sm backdrop-blur transition hover:bg-white md:left-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-wine shadow-sm backdrop-blur transition hover:bg-white md:right-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
