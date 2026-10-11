'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@/components/icons'
import type { Category, Product } from '@/data/types'

export function ProductsTable({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.sku.toLowerCase().includes(q)
      )
        return false
      if (category !== 'all' && p.category !== category) return false
      if (status !== 'all' && p.status !== status) return false
      return true
    })
  }, [products, query, category, status])

  const deletingProduct = products.find((p) => p.id === toDelete)

  const handleDelete = async () => {
    if (!deletingProduct) return
    setBusy(true)
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast({
        title: 'Product deleted',
        description: deletingProduct.name,
        variant: 'info',
      })
      setToDelete(null)
      router.refresh()
    } catch {
      toast({ title: "Couldn't delete product", variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your catalog — add, edit or archive items.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button leadingIcon={<IconPlus width={16} height={16} />}>
            Add Product
          </Button>
        </Link>
      </header>

      <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Input
            leadingIcon={<IconSearch width={16} height={16} />}
            placeholder="Search products by name or SKU"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            className="sm:w-48"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            className="sm:w-40"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-ink-900">
              No products found
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Adjust the filters or add a new product to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-ink-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-ink-900">
                              {p.name}
                            </p>
                            <p className="text-xs text-ink-500">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-600 capitalize">
                        {p.category.replaceAll('-', ' ')}
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-ink-900">
                            {formatPrice(p.discountPrice ?? p.price)}
                          </p>
                          {p.discountPrice && (
                            <p className="text-xs text-ink-400 line-through">
                              {formatPrice(p.price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StockLabel stock={p.stock} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                            aria-label="Edit"
                          >
                            <IconEdit width={16} height={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setToDelete(p.id)}
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
              {filtered.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-ink-500 capitalize">
                        {p.category.replaceAll('-', ' ')} · {p.sku}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="font-semibold text-ink-900">
                          {formatPrice(p.discountPrice ?? p.price)}
                        </span>
                        <StockLabel stock={p.stock} small />
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                        aria-label="Edit"
                      >
                        <IconEdit width={16} height={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(p.id)}
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
        title="Delete product?"
        description={
          deletingProduct
            ? `“${deletingProduct.name}” will be removed from your catalog.`
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
          This will remove the product from the store immediately.
        </p>
      </Modal>
    </div>
  )
}

function StockLabel({ stock, small }: { stock: number; small?: boolean }) {
  if (stock === 0) return <Badge tone="danger">Out of stock</Badge>
  if (stock <= 5) return <Badge tone="warning">{stock} left</Badge>
  return (
    <span
      className={
        small
          ? 'inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700'
          : 'text-sm font-medium text-ink-800'
      }
    >
      {stock} in stock
    </span>
  )
}

function StatusBadge({
  status,
}: {
  status: 'active' | 'draft' | 'archived'
}) {
  if (status === 'active') return <Badge tone="success">Active</Badge>
  if (status === 'draft') return <Badge tone="warning">Draft</Badge>
  return <Badge tone="default">Archived</Badge>
}
