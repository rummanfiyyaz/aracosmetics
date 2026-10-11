'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { ImageInput } from '@/components/admin/ImageInput'
import { IconChevronRight, IconTrash } from '@/components/icons'
import type { HeroSlide } from '@/data/types'

interface FormState {
  image: string
  eyebrow: string
  title: string
  highlight: string
  description: string
  ctaLabel: string
  ctaHref: string
  hidden: boolean
  sortOrder: string
}

export function HeroSlideForm({ existing }: { existing?: HeroSlide }) {
  const isEdit = !!existing
  const { toast } = useToast()
  const router = useRouter()

  const [form, setForm] = useState<FormState>(() => {
    if (existing) {
      return {
        image: existing.image,
        eyebrow: existing.eyebrow ?? '',
        title: existing.title,
        highlight: existing.highlight ?? '',
        description: existing.description ?? '',
        ctaLabel: existing.ctaLabel,
        ctaHref: existing.ctaHref,
        hidden: !!existing.hidden,
        sortOrder: existing.sortOrder?.toString() ?? '',
      }
    }
    return {
      image: '',
      eyebrow: '',
      title: '',
      highlight: '',
      description: '',
      ctaLabel: 'Shop Now',
      ctaHref: '/',
      hidden: false,
      sortOrder: '',
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.image) e.image = 'Add a slide background image'
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.ctaLabel.trim()) e.ctaLabel = 'Button label is required'
    if (!form.ctaHref.trim()) e.ctaHref = 'Button link is required'
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

    const payload: Partial<HeroSlide> = {
      image: form.image,
      eyebrow: form.eyebrow.trim(),
      title: form.title.trim(),
      highlight: form.highlight.trim() || undefined,
      description: form.description.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaHref: form.ctaHref.trim(),
      hidden: form.hidden,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
    }

    try {
      const res = await fetch(
        isEdit ? `/api/hero-slides/${existing!.id}` : '/api/hero-slides',
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
        title: isEdit ? 'Slide saved' : 'Slide created',
      })
      router.push('/admin/hero-slides')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast({ title: 'Save failed', description: message, variant: 'error' })
      setSubmitting(false)
    }
  }

  const removeSlide = async () => {
    if (!existing) return
    if (!confirm('Delete this slide?')) return
    try {
      const res = await fetch(`/api/hero-slides/${existing.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      toast({ title: 'Slide deleted', variant: 'info' })
      router.push('/admin/hero-slides')
      router.refresh()
    } catch {
      toast({ title: "Couldn't delete slide", variant: 'error' })
    }
  }

  const title = useMemo(
    () => (isEdit ? 'Edit slide' : 'Add slide'),
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
          <Link href="/admin/hero-slides" className="hover:text-ink-800">
            Hero slides
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
              Slides rotate on the storefront home page hero carousel.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/hero-slides">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save Slide' : 'Create Slide'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Background</p>
            <p className="mt-1 text-xs text-ink-500">
              Wide 16:9 works best. Dark or high-contrast images pair well with
              the overlay.
            </p>
            <div className="mt-4">
              <ImageInput
                label="Slide image"
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                error={errors.image}
                aspectClass="aspect-video"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Content</p>
            <div className="mt-4 grid gap-4">
              <Input
                label="Eyebrow (small text above title)"
                placeholder="New arrivals"
                value={form.eyebrow}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eyebrow: e.target.value }))
                }
                maxLength={60}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Title"
                  placeholder="Everyday made"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  error={errors.title}
                />
                <Input
                  label="Highlight (accent line)"
                  placeholder="a little lovelier."
                  value={form.highlight}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, highlight: e.target.value }))
                  }
                  hint="Rendered on a new line in the accent color."
                />
              </div>
              <Textarea
                label="Description"
                rows={3}
                placeholder="A short sentence about the slide…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Call to action</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Button label"
                placeholder="Shop Now"
                value={form.ctaLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaLabel: e.target.value }))
                }
                error={errors.ctaLabel}
              />
              <Input
                label="Button link"
                placeholder="/kitchen-products"
                value={form.ctaHref}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaHref: e.target.value }))
                }
                error={errors.ctaHref}
                hint="Use a storefront path like /water-bottles or a full URL."
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Visibility</p>
            <label className="mt-3 flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/40 px-4 py-3 text-sm text-ink-800">
              <span>Hide from carousel</span>
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hidden: e.target.checked }))
                }
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
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
              hint="Lower numbers appear first."
              error={errors.sortOrder}
              className="mt-3"
            />
          </section>

          {isEdit && (
            <section className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 sm:p-6">
              <p className="text-sm font-semibold text-rose-800">Danger zone</p>
              <Button
                variant="danger"
                type="button"
                className="mt-3"
                size="sm"
                leadingIcon={<IconTrash width={14} height={14} />}
                onClick={removeSlide}
              >
                Delete slide
              </Button>
            </section>
          )}
        </aside>
      </div>
    </form>
  )
}
