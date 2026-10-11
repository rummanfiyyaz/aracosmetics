'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { IconEdit, IconEye, IconPlus, IconSearch, IconTrash } from '@/components/icons'
import type { Category } from '@/data/types'

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    )
  }, [categories, query])

  const deletingCategory = categories.find((c) => c.id === toDelete)

  const handleDelete = async () => {
    if (!deletingCategory) return
    setBusy(true)
    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast({
        title: 'Category deleted',
        description: deletingCategory.name,
        variant: 'info',
      })
      setToDelete(null)
      router.refresh()
    } catch {
      toast({ title: "Couldn't delete category", variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const toggleHidden = async (c: Category) => {
    setTogglingId(c.id)
    try {
      const res = await fetch(`/api/categories/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !c.hidden }),
      })
      if (!res.ok) throw new Error('Failed')
      toast({
        title: c.hidden ? 'Category shown' : 'Category hidden',
        description: c.name,
      })
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
            Categories
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage the storefront navigation — add, hide or reorder categories.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button leadingIcon={<IconPlus width={16} height={16} />}>
            Add Category
          </Button>
        </Link>
      </header>

      <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
        <Input
          leadingIcon={<IconSearch width={16} height={16} />}
          placeholder="Search categories by name or slug"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-ink-900">
              No categories found
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Adjust the search or add a new category to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">URL</th>
                    <th className="px-5 py-3">Sort</th>
                    <th className="px-5 py-3">Visibility</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-ink-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.image}
                            alt=""
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-ink-900">
                              {c.name}
                            </p>
                            {c.short && (
                              <p className="text-xs text-ink-500 line-clamp-1">
                                {c.short}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-600">
                        /{c.slug}
                      </td>
                      <td className="px-5 py-3 text-ink-600">
                        {c.sortOrder ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        {c.hidden ? (
                          <Badge tone="warning">Hidden</Badge>
                        ) : (
                          <Badge tone="success">Visible</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => toggleHidden(c)}
                            disabled={togglingId === c.id}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 disabled:opacity-40"
                            aria-label={c.hidden ? 'Show' : 'Hide'}
                            title={c.hidden ? 'Show on storefront' : 'Hide from storefront'}
                          >
                            <IconEye width={16} height={16} />
                          </button>
                          <Link
                            href={`/admin/categories/${c.id}`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                            aria-label="Edit"
                          >
                            <IconEdit width={16} height={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setToDelete(c.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Delete"
                          >
                            <IconTrash width={16} height={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink-100 md:hidden">
              {filtered.map((c) => (
                <li key={c.id} className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={c.image}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {c.name}
                      </p>
                      <p className="font-mono text-xs text-ink-500">/{c.slug}</p>
                      <div className="mt-2">
                        {c.hidden ? (
                          <Badge tone="warning">Hidden</Badge>
                        ) : (
                          <Badge tone="success">Visible</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => toggleHidden(c)}
                        disabled={togglingId === c.id}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 disabled:opacity-40"
                        aria-label={c.hidden ? 'Show' : 'Hide'}
                      >
                        <IconEye width={16} height={16} />
                      </button>
                      <Link
                        href={`/admin/categories/${c.id}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                        aria-label="Edit"
                      >
                        <IconEdit width={16} height={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(c.id)}
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
          </>
        )}
      </section>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete category?"
        description={
          deletingCategory
            ? `“${deletingCategory.name}” will be removed from the storefront.`
            : undefined
        }
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
          Products in this category won&rsquo;t be deleted, but customers
          won&rsquo;t be able to browse the category page.
        </p>
      </Modal>
    </div>
  )
}
