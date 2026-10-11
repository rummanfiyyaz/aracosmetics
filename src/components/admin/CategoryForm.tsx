'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { ImageInput } from '@/components/admin/ImageInput'
import { IconChevronRight, IconTrash } from '@/components/icons'
import { RESERVED_SLUGS } from '@/data/categories'
import type { Category } from '@/data/types'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface FormState {
  name: string
  slug: string
  slugTouched: boolean
  short: string
  description: string
  image: string
  banner: string
  hidden: boolean
  sortOrder: string
}

export function CategoryForm({ existing }: { existing?: Category }) {
  const isEdit = !!existing
  const { toast } = useToast()
  const router = useRouter()

  const [form, setForm] = useState<FormState>(() => {
    if (existing) {
      return {
        name: existing.name,
        slug: existing.slug,
        slugTouched: true,
        short: existing.short ?? '',
        description: existing.description ?? '',
        image: existing.image,
        banner: existing.banner,
        hidden: !!existing.hidden,
        sortOrder: existing.sortOrder?.toString() ?? '',
      }
    }
    return {
      name: '',
      slug: '',
      slugTouched: false,
      short: '',
      description: '',
      image: '',
      banner: '',
      hidden: false,
      sortOrder: '',
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    const slug = form.slug.trim().toLowerCase()
    if (!slug) e.slug = 'Slug is required'
    else if (!SLUG_RE.test(slug))
      e.slug = 'Lowercase letters, numbers and dashes only'
    else if (RESERVED_SLUGS.has(slug)) e.slug = `"${slug}" is reserved`
    if (!form.image) e.image = 'Add a category thumbnail'
    if (!form.banner) e.banner = 'Add a category banner'
    if (form.sortOrder && Number.isNaN(Number(form.sortOrder)))
      e.sortOrder = 'Must be a number'
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

    const payload: Partial<Category> = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      short: form.short.trim(),
      description: form.description.trim(),
      image: form.image,
      banner: form.banner,
      hidden: form.hidden,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
    }

    try {
      const res = await fetch(
        isEdit ? `/api/categories/${existing!.id}` : '/api/categories',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = (await res.json()) as { error?: string }
      if (!res.ok)
        throw new Error(data.error || (isEdit ? 'Save failed' : 'Create failed'))
      toast({
        title: isEdit ? 'Category saved' : 'Category created',
        description: payload.name,
      })
      router.push('/admin/categories')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast({ title: 'Save failed', description: message, variant: 'error' })
      setSubmitting(false)
    }
  }

  const removeCategory = async () => {
    if (!existing) return
    if (!confirm(`Delete "${existing.name}"? This can't be undone.`)) return
    try {
      const res = await fetch(`/api/categories/${existing.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      toast({ title: 'Category deleted', variant: 'info' })
      router.push('/admin/categories')
      router.refresh()
    } catch {
      toast({ title: "Couldn't delete category", variant: 'error' })
    }
  }

  const title = useMemo(
    () => (isEdit ? 'Edit category' : 'Add category'),
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
          <Link href="/admin/categories" className="hover:text-ink-800">
            Categories
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
                ? 'Update the display name, imagery and visibility for this category.'
                : 'Create a new category to organize products in the storefront.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/categories">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Category' : 'Create Category'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Basic information</p>
            <div className="mt-4 grid gap-4">
              <Input
                label="Category name"
                placeholder="e.g. Kitchen Products"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.slugTouched ? f.slug : slugify(e.target.value),
                  }))
                }
                error={errors.name}
              />
              <Input
                label="URL slug"
                placeholder="kitchen-products"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slug: e.target.value,
                    slugTouched: true,
                  }))
                }
                hint={
                  form.slug
                    ? `Storefront URL: /${form.slug}`
                    : 'Auto-generated from name if left empty.'
                }
                error={errors.slug}
              />
              <Input
                label="Short tagline"
                placeholder="Everyday essentials for the kitchen."
                value={form.short}
                onChange={(e) =>
                  setForm((f) => ({ ...f, short: e.target.value }))
                }
                maxLength={120}
              />
              <Textarea
                label="Description"
                placeholder="A short paragraph shown on the category page…"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Imagery</p>
            <p className="mt-1 text-xs text-ink-500">
              Thumbnail appears in the storefront category grid; banner appears
              at the top of the category page.
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <ImageInput
                label="Thumbnail"
                hint="Portrait 4:5 works best."
                value={form.image}
                onChange={(url) =>
                  setForm((f) => ({ ...f, image: url }))
                }
                error={errors.image}
                aspectClass="aspect-[4/5]"
              />
              <ImageInput
                label="Banner"
                hint="Wide 16:9 works best."
                value={form.banner}
                onChange={(url) =>
                  setForm((f) => ({ ...f, banner: url }))
                }
                error={errors.banner}
                aspectClass="aspect-video"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Visibility</p>
            <label className="mt-3 flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/40 px-4 py-3 text-sm text-ink-800">
              <span>Hide from storefront</span>
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hidden: e.target.checked }))
                }
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
            <p className="mt-2 text-xs text-ink-500">
              Hidden categories stay in the admin but disappear from nav,
              footer and the home grid.
            </p>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Sort order</p>
            <Input
              type="number"
              placeholder="10"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, sortOrder: e.target.value }))
              }
              hint="Lower numbers appear first. Leave blank to sort by name."
              error={errors.sortOrder}
              className="mt-3"
            />
          </section>

          {isEdit && (
            <section className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 sm:p-6">
              <p className="text-sm font-semibold text-rose-800">Danger zone</p>
              <p className="mt-1 text-xs text-rose-700/80">
                Deleting a category won&rsquo;t delete its products, but they
                will no longer be reachable through the storefront nav.
              </p>
              <Button
                variant="danger"
                type="button"
                className="mt-3"
                size="sm"
                leadingIcon={<IconTrash width={14} height={14} />}
                onClick={removeCategory}
              >
                Delete category
              </Button>
            </section>
          )}
        </aside>
      </div>
    </form>
  )
}
