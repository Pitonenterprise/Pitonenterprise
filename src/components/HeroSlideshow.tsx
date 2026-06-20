'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type Slide = { url: string; alt: string }

export function HeroSlideshow({
  images,
  intervalMs = 2000,
}: {
  images: Slide[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [images.length, intervalMs])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm bg-line/40">
      {images.map((img, i) => (
        <Image
          key={img.url}
          src={img.url}
          alt={img.alt}
          fill
          priority={i === 0}
          sizes="(max-width: 768px) 62vw, 420px"
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}
