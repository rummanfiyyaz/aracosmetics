'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { IconEdit, IconEye, IconPlus, IconTrash } from '@/components/icons'
import type { HeroSlide } from '@/data/types'

export function HeroSlidesTable({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const deletingSlide = slides.find((s) => s.id === toDelete)

  const handleDelete = async () => {
    if (!deletingSlide) return
    setBusy(true)
    try {
      const res = await fetch(`/api/hero-slides/${deletingSlide.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast({
        title: 'Slide deleted',
        variant: 'info',
      })
      setToDelete(null)
      router.refresh()
    } catch {
      toast({ title: "Couldn't delete slide", variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const toggleHidden = async (s: HeroSlide) => {
    setTogglingId(s.id)
    try {
      const res = await fetch(`/api/hero-slides/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !s.hidden }),
      })
      if (!res.ok) throw new Error('Failed')
      toast({ title: s.hidden ? 'Slide shown' : 'Slide hidden' })
      router.refresh()
    } catch {
      toast({ title: "Couldn't update visibility", variant: 'error' })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Hero slides
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage the rotating banners on the storefront home page.
          </p>
        </div>
        <Link href="/admin/hero-slides/new">
          <Button leadingIcon={<IconPlus width={16} height={16} />}>
            Add Slide
          </Button>
        </Link>
      </header>

      {slides.length === 0 ? (
        <section className="rounded-2xl border border-ink-100 bg-white p-12 text-center shadow-card">
          <p className="text-sm font-semibold text-ink-900">
            No slides yet
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Add at least one slide to show a banner on the home page.
          </p>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((s) => (
            <li
              key={s.id}
              className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card"
            >
              <div className="relative aspect-video bg-ink-100">
                <img
                  src={s.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <p className="text-xs font-medium text-white/80">
                    {s.eyebrow}
                  </p>
                  <p className="text-lg font-semibold leading-tight text-white">
                    {s.title}{' '}
                    {s.highlight && (
                      <span className="text-brand-300">{s.highlight}</span>
                    )}
                  </p>
                </div>
                <div className="absolute right-3 top-3">
                  {s.hidden ? (
                    <Badge tone="warning">Hidden</Badge>
                  ) : (
                    <Badge tone="success">Visible</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-ink-100 px-4 py-3">
                <div className="text-xs text-ink-500">
                  <span className="font-medium text-ink-800">CTA:</span>{' '}
                  {s.ctaLabel} →{' '}
                  <span className="font-mono">{s.ctaHref}</span>
                  {s.sortOrder !== undefined && (
                    <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-700">
                      Sort: {s.sortOrder}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleHidden(s)}
                    disabled={togglingId === s.id}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 disabled:opacity-40"
                    aria-label={s.hidden ? 'Show' : 'Hide'}
                    title={s.hidden ? 'Show on storefront' : 'Hide from storefront'}
                  >
                    <IconEye width={16} height={16} />
                  </button>
                  <Link
                    href={`/admin/hero-slides/${s.id}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                    aria-label="Edit"
                  >
                    <IconEdit width={16} height={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToDelete(s.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete"
                  >
                    <IconTrash width={16} height={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete slide?"
        description="This slide will be removed from the storefront carousel."
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          You can add another slide any time from this page.
        </p>
      </Modal>
    </div>
  )
}
