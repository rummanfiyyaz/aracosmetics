'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import type { Product } from '@/data/types'
import { formatPrice } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { IconCart, IconEye } from '@/components/icons'

interface Props {
  product: Product
  compact?: boolean
}

export function ProductCard({ product, compact }: Props) {
  const { addItem, openCart } = useCart()
  const { toast } = useToast()

  const price = product.discountPrice ?? product.price
  const hasDiscount = typeof product.discountPrice === 'number'
  const percentOff =
    hasDiscount && product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-ink-200">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-ink-50"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge tone="sale" className="shadow-sm">
              -{percentOff}%
            </Badge>
          )}
          {outOfStock && <Badge tone="danger">Out of stock</Badge>}
          {!outOfStock && lowStock && <Badge tone="warning">Low stock</Badge>}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              if (outOfStock) return
              addItem(product, 1)
              openCart()
              toast({
                title: 'Added to cart',
                description: product.name,
              })
            }}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-ink-800 disabled:opacity-50"
          >
            <IconCart width={14} height={14} />
            Add to Cart
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-ink-800 shadow-sm">
            <IconEye width={16} height={16} />
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-700 transition-colors"
          >
            {product.name}
          </Link>
        </div>
        <Rating value={product.rating} count={product.reviewCount} showValue />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-semibold text-ink-900">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-ink-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        {!compact && !outOfStock && (
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            In stock
          </div>
        )}
      </div>
    </div>
  )
}
