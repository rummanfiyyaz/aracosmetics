'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import {
  IconChevronLeft,
  IconChevronRight,
} from '@/components/icons'
import type { HeroSlide } from '@/data/types'

export function HeroCarousel({
  slides,
  intervalMs = 5000,
}: {
  slides: HeroSlide[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = slides.length

  const goTo = useCallback(
    (n: number) => setIndex(((n % total) + total) % total),
    [total],
  )
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (paused || total <= 1) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), intervalMs)
    return () => window.clearInterval(id)
  }, [paused, intervalMs, total])

  return (
    <section
      className="relative overflow-hidden bg-ink-900 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            aria-hidden={i !== index}
          >
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/85 via-ink-900/55 to-ink-900/20" />
            <div className="container-page relative flex h-full flex-col justify-center py-10">
              <div className="max-w-xl animate-fade-in">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                  {slide.eyebrow}
                </span>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {slide.title}
                  {slide.highlight ? (
                    <>
                      <br />
                      <span className="text-brand-300">{slide.highlight}</span>
                    </>
                  ) : null}
                </h1>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                  {slide.description}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href={slide.ctaHref}>
                    <Button
                      size="lg"
                      trailingIcon={<IconChevronRight width={16} height={16} />}
                    >
                      {slide.ctaLabel}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 sm:grid place-items-center"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 sm:grid place-items-center"
          >
            <IconChevronRight />
          </button>
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
