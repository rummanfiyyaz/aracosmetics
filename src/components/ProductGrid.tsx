'use client'

import type { Product } from '@/data/types'
import { ProductCard } from './ProductCard'

export function ProductGrid({
  products,
  emptyMessage = 'No products to show.',
}: {
  products: Product[]
  emptyMessage?: string
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/40 p-14 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-ink-400 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 20L16.7 16.7M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink-800">{emptyMessage}</p>
        <p className="mt-1 text-sm text-ink-500">
          Try adjusting your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white"
        >
          <div className="aspect-square animate-pulse bg-ink-100" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
