'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Category, Product } from '@/data/types'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice, formatDate } from '@/lib/format'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductGrid } from '@/components/ProductGrid'
import { Rating } from '@/components/ui/Rating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import {
  IconChevronRight,
  IconHeart,
  IconMinus,
  IconPlus,
  IconShield,
  IconStar,
  IconTruck,
} from '@/components/icons'
import { cn } from '@/lib/cn'
import type { Review } from '@/data/types'

type Tab = 'description' | 'features' | 'specifications' | 'shipping'

export function ProductDetailView({
  product,
  related,
  category,
}: {
  product?: Product
  related: Product[]
  category?: Category
}) {

  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<Tab>('description')
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0]?.id,
  )
  const [wishlisted, setWishlisted] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(product?.reviews ?? [])
  const [reviewStats, setReviewStats] = useState({
    rating: product?.rating ?? 0,
    reviewCount: product?.reviewCount ?? 0,
  })

  const router = useRouter()
  const { addItem, openCart } = useCart()
  const { toast } = useToast()

  const price = useMemo(
    () => (product ? product.discountPrice ?? product.price : 0),
    [product],
  )

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-lg font-semibold text-ink-900">Product not found</p>
        <p className="mt-2 text-sm text-ink-500">
          It may have been removed or the link is invalid.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button size="md">Back to home</Button>
        </Link>
      </div>
    )
  }

  const hasDiscount = typeof product.discountPrice === 'number'
  const outOfStock = product.stock === 0
  const lowStock = !outOfStock && product.stock <= 5

  const variantLabel = product.variants?.find((v) => v.id === selectedVariant)?.label

  const handleAdd = () => {
    if (outOfStock) return
    addItem(product, quantity, variantLabel)
    openCart()
    toast({ title: 'Added to cart', description: product.name })
  }
  const handleBuy = () => {
    if (outOfStock) return
    addItem(product, quantity, variantLabel)
    router.push('/cart')
  }

  return (
    <>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-xs text-ink-500">
            <Link href="/" className="hover:text-ink-800">
              Home
            </Link>
            <IconChevronRight width={12} height={12} />
            {category && (
              <>
                <Link href={`/${category.slug}`} className="hover:text-ink-800">
                  {category.name}
                </Link>
                <IconChevronRight width={12} height={12} />
              </>
            )}
            <span className="text-ink-800">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="container-page py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} alt={product.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {hasDiscount && (
                <Badge tone="sale">
                  {Math.round(
                    ((product.price - product.discountPrice!) / product.price) *
                      100,
                  )}
                  % off
                </Badge>
              )}
              {outOfStock ? (
                <Badge tone="danger">Out of stock</Badge>
              ) : lowStock ? (
                <Badge tone="warning">Only {product.stock} left</Badge>
              ) : (
                <Badge tone="success">In stock</Badge>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} showValue />
              <span className="text-xs text-ink-400">·</span>
              <span className="text-xs text-ink-500">SKU: {product.sku}</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-ink-900 sm:text-3xl">
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-base text-ink-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">
              {product.shortDescription}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-ink-900">
                  Color:{' '}
                  <span className="text-ink-500 font-normal">
                    {variantLabel}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                        selectedVariant === v.id
                          ? 'border-ink-900 bg-ink-900 text-white'
                          : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400',
                      )}
                    >
                      {v.swatch && (
                        <span
                          className="h-4 w-4 rounded-full ring-1 ring-black/10"
                          style={{ background: v.swatch }}
                        />
                      )}
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-lg border border-ink-200 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid h-11 w-11 place-items-center text-ink-600 hover:bg-ink-50 rounded-l-lg"
                  aria-label="Decrease"
                >
                  <IconMinus />
                </button>
                <span className="min-w-[2.5rem] px-2 text-center text-sm font-medium text-ink-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock || 99, q + 1))
                  }
                  className="grid h-11 w-11 place-items-center text-ink-600 hover:bg-ink-50 rounded-r-lg"
                  aria-label="Increase"
                >
                  <IconPlus />
                </button>
              </div>
              <Button
                size="lg"
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex-1 min-w-[10rem]"
              >
                Add to Cart
              </Button>
              <Button
                variant="brand"
                size="lg"
                onClick={handleBuy}
                disabled={outOfStock}
              >
                Order Now
              </Button>
              <button
                type="button"
                onClick={() => setWishlisted((v) => !v)}
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-lg border transition-colors',
                  wishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50',
                )}
                aria-label="Wishlist"
                aria-pressed={wishlisted}
              >
                <IconHeart />
              </button>
            </div>

            <ul className="mt-6 grid gap-3 rounded-2xl border border-ink-100 bg-ink-50/40 p-4 text-sm text-ink-700">
              <li className="flex items-center gap-2">
                <IconTruck width={16} height={16} className="text-ink-500" />
                Free worldwide shipping
              </li>
              <li className="flex items-center gap-2">
                <IconShield width={16} height={16} className="text-ink-500" />
                Secure checkout with Stripe
              </li>
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14 lg:mt-16">
          <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-ink-100">
            {(
              [
                ['description', 'Description'],
                ['features', 'Features'],
                ['specifications', 'Specifications'],
                ['shipping', 'Shipping'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  '-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  tab === id
                    ? 'border-ink-900 text-ink-900'
                    : 'border-transparent text-ink-500 hover:text-ink-800',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="prose max-w-none py-6 text-sm text-ink-700 sm:text-base">
            {tab === 'description' && (
              <p className="leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}
            {tab === 'features' && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'specifications' && (
              <dl className="grid gap-3 sm:grid-cols-2">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-4 py-3"
                  >
                    <dt className="text-sm text-ink-500">{k}</dt>
                    <dd className="text-sm font-medium text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {tab === 'shipping' && (
              <div className="space-y-3">
                <p>
                  Orders placed before 2pm local time ship the same business
                  day. Free shipping is included on all orders.
                </p>
                <p>
                  Standard international delivery takes 5–10 business days.
                  You will receive tracking as soon as the order leaves our
                  studio.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-ink-500">
              Customer Reviews
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-ink-900">
                {reviewStats.rating.toFixed(1)}
              </span>
              <span className="text-sm text-ink-500">out of 5</span>
            </div>
            <Rating value={reviewStats.rating} size="md" />
            <p className="mt-1 text-xs text-ink-500">
              Based on {reviewStats.reviewCount} reviews
            </p>
            <Button
              size="md"
              variant="secondary"
              className="mt-4"
              onClick={() => setReviewOpen(true)}
            >
              Write a review
            </Button>
          </div>
          <div className="lg:col-span-2">
            {reviews.length === 0 && (
              <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-500">
                No reviews yet. Be the first to share your thoughts.
              </div>
            )}
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-ink-100 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                        {r.author
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">
                          {r.author}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatDate(r.date)}
                        </p>
                      </div>
                    </div>
                    <Rating value={r.rating} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink-900">
                    {r.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page pb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink-900 sm:text-2xl">
              You may also like
            </h2>
            <Link
              href={`/${product.category}`}
              className="text-sm font-medium text-ink-700 hover:text-ink-900 inline-flex items-center gap-1"
            >
              View all
              <IconChevronRight width={14} height={14} />
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      )}

      <ReviewFormModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        productSlug={product.slug}
        onSubmitted={(updated) => {
          setReviews(updated.reviews)
          setReviewStats({
            rating: updated.rating,
            reviewCount: updated.reviewCount,
          })
          setReviewOpen(false)
          toast({
            title: 'Thanks for your review',
            description: 'Your feedback has been posted.',
          })
        }}
      />
    </>
  )
}

function ReviewFormModal({
  open,
  onClose,
  productSlug,
  onSubmitted,
}: {
  open: boolean
  onClose: () => void
  productSlug: string
  onSubmitted: (product: Product) => void
}) {
  const [author, setAuthor] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setAuthor('')
    setTitle('')
    setBody('')
    setRating(5)
    setHover(0)
    setError(null)
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!author.trim() || !title.trim() || !body.trim()) {
      setError('Please fill in your name, title and review.')
      return
    }
    if (rating < 1 || rating > 5) {
      setError('Please pick a rating from 1 to 5.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/products/${encodeURIComponent(productSlug)}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, title, body, rating }),
        },
      )
      const data = (await res.json()) as { product?: Product; error?: string }
      if (!res.ok || !data.product) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      reset()
      onSubmitted(data.product)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Write a review"
      description="Share your experience with this product."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Your rating</label>
          <div
            className="mt-1 flex items-center gap-1"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
                className="p-0.5"
              >
                <IconStar
                  width={26}
                  height={26}
                  className={cn(
                    n <= (hover || rating)
                      ? 'text-amber-400'
                      : 'text-ink-200',
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <Input
          name="author"
          label="Name"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={80}
          required
        />
        <Input
          name="title"
          label="Title"
          placeholder="Sum up your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
        <Textarea
          name="body"
          label="Your review"
          placeholder="What did you like or dislike?"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          required
        />
        {error && (
          <p className="text-sm text-rose-600">{error}</p>
        )}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="brand" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
