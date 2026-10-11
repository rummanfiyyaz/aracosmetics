'use client'

import { useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import type { Category, CategorySlug, Product } from '@/data/types'
import { IconChevronRight, IconClose, IconPlus, IconTrash } from '@/components/icons'

interface FormState {
  name: string
  category: CategorySlug
  description: string
  images: string[]
  price: string
  discountPrice: string
  stock: string
  sku: string
  variants: string
  status: 'active' | 'draft' | 'archived'
  featured: boolean
}

const buildDefaultState = (categories: Category[]): FormState => ({
  name: '',
  category: categories[0]?.slug ?? '',
  description: '',
  images: [],
  price: '',
  discountPrice: '',
  stock: '',
  sku: '',
  variants: '',
  status: 'active',
  featured: false,
})

export function ProductForm({
  existing,
  categories,
}: {
  existing?: Product
  categories: Category[]
}) {
  const isEdit = !!existing
  const { toast } = useToast()
  const router = useRouter()

  const [form, setForm] = useState<FormState>(() => {
    if (existing) {
      return {
        name: existing.name,
        category: existing.category,
        description: existing.description,
        images: [...existing.images],
        price: existing.price.toString(),
        discountPrice: existing.discountPrice?.toString() ?? '',
        stock: existing.stock.toString(),
        sku: existing.sku,
        variants:
          existing.variants?.map((v) => v.label).join(', ') ?? '',
        status: existing.status,
        featured: !!existing.featured,
      }
    }
    return buildDefaultState(categories)
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const uploadEnabled = Boolean(cloudName && uploadPreset)

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!uploadEnabled) {
      toast({
        title: 'Image upload not configured',
        description:
          'Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
        variant: 'error',
      })
      return
    }
    setUploading(true)
    try {
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const body = new FormData()
        body.append('file', file)
        body.append('upload_preset', uploadPreset!)
        const res = await fetch(endpoint, { method: 'POST', body })
        if (!res.ok) throw new Error(`Cloudinary rejected ${file.name}`)
        const json = (await res.json()) as { secure_url?: string }
        if (!json.secure_url) throw new Error(`No URL returned for ${file.name}`)
        uploaded.push(json.secure_url)
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }))
      setErrors((e) => ({ ...e, images: '' }))
      toast({
        title: `Uploaded ${uploaded.length} image${uploaded.length === 1 ? '' : 's'}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast({ title: 'Upload failed', description: message, variant: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const priceNum = Number(form.price)
  const discountNum = form.discountPrice ? Number(form.discountPrice) : undefined
  const stockNum = Number(form.stock)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.price.trim() || Number.isNaN(priceNum) || priceNum <= 0)
      e.price = 'Enter a valid price'
    if (
      form.discountPrice &&
      (Number.isNaN(discountNum!) || discountNum! >= priceNum)
    )
      e.discountPrice = 'Discount price must be less than the price'
    if (!form.sku.trim()) e.sku = 'SKU is required'
    if (!form.stock.trim() || Number.isNaN(stockNum) || stockNum < 0)
      e.stock = 'Enter a valid stock quantity'
    if (form.images.length === 0) e.images = 'Add at least one product image'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      toast({ title: 'Please fix the form errors', variant: 'error' })
      return
    }
    setSubmitting(true)

    const variants = form.variants
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map((label) => ({ id: label.toLowerCase().replace(/\s+/g, '-'), label }))

    const payload: Partial<Product> = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      shortDescription: form.description.trim().slice(0, 140),
      images: form.images,
      price: priceNum,
      discountPrice: discountNum,
      stock: stockNum,
      sku: form.sku.trim(),
      status: form.status,
      featured: form.featured,
      variants: variants.length ? variants : undefined,
    }

    try {
      if (isEdit && existing) {
        const res = await fetch(`/api/products/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Save failed')
        toast({ title: 'Product saved', description: payload.name })
      } else {
        payload.slug = payload
          .name!.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        payload.rating = 0
        payload.reviewCount = 0
        payload.features = []
        payload.specifications = {}
        payload.reviews = []
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Create failed')
        toast({ title: 'Product created', description: payload.name })
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast({ title: 'Save failed', description: message, variant: 'error' })
      setSubmitting(false)
    }
  }

  const removeImage = (idx: number) =>
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx),
    }))

  const archiveProduct = async () => {
    if (!existing) return
    try {
      await fetch(`/api/products/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      toast({ title: 'Product archived', variant: 'info' })
      router.push('/admin/products')
      router.refresh()
    } catch {
      toast({ title: "Couldn't archive product", variant: 'error' })
    }
  }

  const title = useMemo(
    () => (isEdit ? 'Edit product' : 'Add product'),
    [isEdit],
  )

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-xs text-ink-500">
          <Link href="/admin" className="hover:text-ink-800">
            Dashboard
          </Link>
          <IconChevronRight width={12} height={12} />
          <Link href="/admin/products" className="hover:text-ink-800">
            Products
          </Link>
          <IconChevronRight width={12} height={12} />
          <span className="text-ink-800">{title}</span>
        </nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {isEdit
                ? 'Update details, media and inventory for this product.'
                : 'Create a new product listing for your store.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/products">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Product'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">
              Basic information
            </p>
            <div className="mt-4 grid gap-4">
              <Input
                label="Product name"
                placeholder="e.g. Aero 500 Water Bottle"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                error={errors.name}
              />
              <Textarea
                label="Description"
                placeholder="A short story about the product…"
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                error={errors.description}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as CategorySlug,
                    }))
                  }
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as FormState['status'],
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Media</p>
            <p className="mt-1 text-xs text-ink-500">
              Upload images from your device — the first image is used as the product cover.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => uploadFiles(e.target.files)}
              />
              <Button
                type="button"
                variant="secondary"
                leadingIcon={<IconPlus width={16} height={16} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !uploadEnabled}
                title={
                  uploadEnabled
                    ? undefined
                    : 'Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
                }
              >
                {uploading ? 'Uploading…' : 'Upload files'}
              </Button>
            </div>
            {errors.images && (
              <p className="mt-2 text-xs text-rose-600">{errors.images}</p>
            )}
            {form.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {form.images.map((src, i) => (
                  <div
                    key={src + i}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-ink-50"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-ink-900/80 px-2 py-0.5 text-[10px] font-medium text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-ink-700 opacity-0 shadow group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <IconClose width={12} height={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">
              Variants (optional)
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Comma-separate any color or size options — e.g. Black, Sand, Sage.
            </p>
            <Textarea
              rows={3}
              value={form.variants}
              onChange={(e) =>
                setForm((f) => ({ ...f, variants: e.target.value }))
              }
              placeholder="Matte Black, Sage, Sand"
              className="mt-3"
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Pricing</p>
            <div className="mt-4 grid gap-4">
              <Input
                label="Price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                error={errors.price}
              />
              <Input
                label="Discount price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={form.discountPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountPrice: e.target.value }))
                }
                error={errors.discountPrice}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Storefront</p>
            <p className="mt-1 text-xs text-ink-500">
              Featured products appear in the &ldquo;Trending this week&rdquo;
              slider on the home page.
            </p>
            <label className="mt-3 flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/40 px-4 py-3 text-sm text-ink-800">
              <span>Show in Trending</span>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Inventory</p>
            <div className="mt-4 grid gap-4">
              <Input
                label="Stock quantity"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                error={errors.stock}
              />
              <Input
                label="SKU"
                placeholder="WB-AERO-500"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                error={errors.sku}
              />
            </div>
          </section>

          {isEdit && (
            <section className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 sm:p-6">
              <p className="text-sm font-semibold text-rose-800">Danger zone</p>
              <p className="mt-1 text-xs text-rose-700/80">
                Archiving hides the product from the storefront but keeps it in
                your records.
              </p>
              <Button
                variant="danger"
                type="button"
                className="mt-3"
                size="sm"
                leadingIcon={<IconTrash width={14} height={14} />}
                onClick={archiveProduct}
              >
                Archive product
              </Button>
            </section>
          )}
        </aside>
      </div>
    </form>
  )
}
