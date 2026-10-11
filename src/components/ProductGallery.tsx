'use client'

import { useState, type MouseEvent } from 'react'
import { cn } from '@/lib/cn'
import { IconZoom } from '@/components/icons'

interface Props {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }

  return (
    <div className="grid gap-4 md:grid-cols-[88px_1fr] lg:gap-6">
      <div className="order-2 flex gap-2 overflow-x-auto no-scrollbar md:order-1 md:flex-col md:overflow-visible">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              'relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-ink-50 transition-all',
              i === active
                ? 'border-ink-900'
                : 'border-transparent hover:border-ink-300',
            )}
          >
            <img
              src={src}
              alt={`${alt} thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      <div
        className="order-1 relative aspect-square overflow-hidden rounded-2xl bg-ink-50 md:order-2 cursor-zoom-in group"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => {
          setZoomed(false)
          setPos({ x: 50, y: 50 })
        }}
        onMouseMove={handleMove}
      >
        <img
          src={images[active]}
          alt={alt}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300',
            zoomed ? 'scale-150' : 'scale-100',
          )}
          style={
            zoomed
              ? { transformOrigin: `${pos.x}% ${pos.y}%` }
              : undefined
          }
        />
        <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-700 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
          <IconZoom width={16} height={16} />
        </div>
      </div>
    </div>
  )
}
