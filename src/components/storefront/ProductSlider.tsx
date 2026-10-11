'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Product } from '@/data/types'
import { ProductCard } from '@/components/ProductCard'
import { IconChevronLeft, IconChevronRight } from '@/components/icons'
import { cn } from '@/lib/cn'

export function ProductSlider({
  products,
  emptyMessage = 'No products to show.',
  autoScroll = false,
  autoScrollMs = 3500,
}: {
  products: Product[]
  emptyMessage?: string
  autoScroll?: boolean
  autoScrollMs?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [paused, setPaused] = useState(false)

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateEdges()
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges, products.length])

  useEffect(() => {
    if (!autoScroll || paused || products.length <= 1) return
    const el = trackRef.current
    if (!el) return
    const id = window.setInterval(() => {
      const target = el
      if (!target) return
      const atEnd =
        target.scrollLeft + target.clientWidth >= target.scrollWidth - 4
      if (atEnd) {
        target.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const step = Math.max(target.clientWidth * 0.9, 280)
        target.scrollBy({ left: step, behavior: 'smooth' })
      }
    }, autoScrollMs)
    return () => window.clearInterval(id)
  }, [autoScroll, autoScrollMs, paused, products.length])

  const scrollByAmount = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const step = Math.max(el.clientWidth * 0.9, 280)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/40 p-14 text-center">
        <p className="text-sm font-medium text-ink-800">{emptyMessage}</p>
        <p className="mt-1 text-sm text-ink-500">
          Mark products as <span className="font-semibold">Featured</span> in the
          admin dashboard to feature them here.
        </p>
      </div>
    )
  }

  const pauseHandlers = autoScroll
    ? {
        onMouseEnter: () => setPaused(true),
        onMouseLeave: () => setPaused(false),
        onTouchStart: () => setPaused(true),
        onTouchEnd: () => setPaused(false),
        onFocusCapture: () => setPaused(true),
        onBlurCapture: () => setPaused(false),
      }
    : {}

  return (
    <div className="relative" {...pauseHandlers}>
      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 lg:gap-6"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-[24%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByAmount(-1)}
        disabled={!canPrev}
        className={cn(
          'absolute -left-2 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full border border-ink-100 bg-white p-2.5 text-ink-700 shadow-card transition sm:grid',
          canPrev
            ? 'opacity-100 hover:bg-ink-900 hover:text-white'
            : 'cursor-not-allowed opacity-0',
        )}
      >
        <IconChevronLeft />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByAmount(1)}
        disabled={!canNext}
        className={cn(
          'absolute -right-2 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full border border-ink-100 bg-white p-2.5 text-ink-700 shadow-card transition sm:grid',
          canNext
            ? 'opacity-100 hover:bg-ink-900 hover:text-white'
            : 'cursor-not-allowed opacity-0',
        )}
      >
        <IconChevronRight />
      </button>
    </div>
  )
}
