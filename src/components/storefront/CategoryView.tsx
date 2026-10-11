'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/ProductGrid'
import { Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { IconChevronRight, IconFilter } from '@/components/icons'
import type { Category, Product } from '@/data/types'

type Sort = 'featured' | 'newest' | 'price-asc' | 'price-desc'

interface Props {
  category?: Category
  products: Product[]
}

export function CategoryView({ category, products }: Props) {
  const [sort, setSort] = useState<Sort>('featured')
  const [availability, setAvailability] = useState<'all' | 'in-stock' | 'sale'>(
    'all',
  )
  const [priceMax, setPriceMax] = useState<number | null>(null)

  const sorted = useMemo(() => {
    let list: Product[] = [...products]

    if (availability === 'in-stock') list = list.filter((p) => p.stock > 0)
    if (availability === 'sale')
      list = list.filter((p) => typeof p.discountPrice === 'number')
    if (priceMax !== null)
      list = list.filter((p) => (p.discountPrice ?? p.price) <= priceMax)

    switch (sort) {
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case 'price-asc':
        list.sort(
          (a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price),
        )
        break
      case 'price-desc':
        list.sort(
          (a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price),
        )
        break
      default:
        list.sort((a, b) => Number(b.featured ?? 0) - Number(a.featured ?? 0))
    }
    return list
  }, [products, sort, availability, priceMax])

  const maxPrice = useMemo(
    () =>
      products.length
        ? Math.max(...products.map((p) => p.discountPrice ?? p.price))
        : 0,
    [products],
  )

  if (!category) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-lg font-semibold text-ink-900">Category not found</p>
        <p className="mt-2 text-sm text-ink-500">
          The page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button size="md">Back to home</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <section className="relative overflow-hidden bg-ink-100">
        <div className="absolute inset-0">
          <img
            src={category.banner}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />
        </div>
        <div className="container-page relative py-16 sm:py-20">
          <nav className="flex items-center gap-2 text-xs text-white/80">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <IconChevronRight width={12} height={12} />
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
            {category.description}
          </p>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-white/80 backdrop-blur">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-ink-600">
              <IconFilter width={14} height={14} />
              <span className="font-medium text-ink-900">{sorted.length}</span>{' '}
              products
            </span>
            <div className="hidden items-center gap-2 sm:flex">
              <FilterChip
                active={availability === 'all'}
                onClick={() => setAvailability('all')}
              >
                All
              </FilterChip>
              <FilterChip
                active={availability === 'in-stock'}
                onClick={() => setAvailability('in-stock')}
              >
                In stock
              </FilterChip>
              <FilterChip
                active={availability === 'sale'}
                onClick={() => setAvailability('sale')}
              >
                On sale
              </FilterChip>
              {maxPrice > 0 && (
                <>
                  <span className="mx-1 h-4 w-px bg-ink-200" />
                  <FilterChip
                    active={priceMax === null}
                    onClick={() => setPriceMax(null)}
                  >
                    Any price
                  </FilterChip>
                  <FilterChip
                    active={priceMax === Math.round(maxPrice / 2)}
                    onClick={() => setPriceMax(Math.round(maxPrice / 2))}
                  >
                    Under ${Math.round(maxPrice / 2)}
                  </FilterChip>
                </>
              )}
            </div>
          </div>
          <div className="w-full sm:w-52">
            <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </Select>
          </div>
        </div>
      </section>

      <section className="container-page py-8 lg:py-12">
        <ProductGrid
          products={sorted}
          emptyMessage="No products match these filters"
        />
      </section>
    </>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
      }`}
    >
      {children}
    </button>
  )
}
