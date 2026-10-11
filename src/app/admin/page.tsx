import Link from 'next/link'
import { listOrders, listProducts } from '@/lib/db'
import { formatPrice, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { SalesChart } from '@/components/admin/SalesChart'
import {
  IconBox,
  IconChevronRight,
  IconClipboard,
  IconTrend,
} from '@/components/icons'
import type { Order } from '@/data/types'

export const dynamic = 'force-dynamic'

function computeSalesByDay(orders: Order[]) {
  const weekdayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
  const days: Array<{ day: string; amount: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const amount = orders
      .filter((o) => o.date === iso && (o.paymentStatus ?? 'unpaid') === 'paid')
      .reduce((sum, o) => sum + o.total, 0)
    days.push({ day: weekdayFmt.format(d), amount })
  }
  return days
}

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([listProducts(), listOrders()])

  const totalProducts = products.length
  const totalOrders = orders.length
  const paidOrders = orders.filter((o) => (o.paymentStatus ?? 'unpaid') === 'paid')
  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0)
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length
  const today = formatDate(new Date().toISOString())
  const salesByDay = computeSalesByDay(orders)
  const hasSales = salesByDay.some((d) => d.amount > 0)

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            An overview of your store, updated in real time.
          </p>
        </div>
        <div className="text-sm text-ink-500">Today · {today}</div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={totalProducts.toString()}
          hint="Active catalog"
          tone="brand"
          icon={<IconBox />}
        />
        <StatCard
          label="Total Orders"
          value={totalOrders.toString()}
          hint={`${orders.filter((o) => o.status === 'pending').length} pending`}
          tone="emerald"
          icon={<IconClipboard />}
        />
        <StatCard
          label="Total Sales"
          value={formatPrice(totalSales)}
          hint="All-time revenue"
          tone="amber"
          icon={<IconTrend />}
        />
        <StatCard
          label="Low Stock"
          value={lowStock.toString()}
          hint={lowStock > 0 ? 'Restock recommended' : 'Everything in stock'}
          tone={lowStock > 0 ? 'rose' : 'ink'}
          icon={<IconBox />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-900">Sales</p>
              <p className="text-xs text-ink-500">Last 7 days</p>
            </div>
          </div>
          {hasSales ? (
            <SalesChart data={salesByDay} />
          ) : (
            <div className="grid h-56 place-items-center text-sm text-ink-500">
              No sales yet — orders will appear here once customers check out.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">Recent orders</p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-700 hover:text-ink-900"
            >
              View all
              <IconChevronRight width={12} height={12} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {orders.slice(0, 5).map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">{o.id}</p>
                    <p className="text-xs text-ink-500">{o.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-900">
                      {formatPrice(o.total)}
                    </p>
                    <OrderBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-100 p-5">
          <div>
            <p className="text-sm font-semibold text-ink-900">Low stock</p>
            <p className="text-xs text-ink-500">
              Products with 5 or fewer units left
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-medium text-ink-700 hover:text-ink-900"
          >
            Manage inventory →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products
                .filter((p) => p.stock <= 5)
                .slice(0, 5)
                .map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-ink-900">
                            {p.name}
                          </p>
                          <p className="text-xs text-ink-500">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-ink-600">
                      {p.category.replaceAll('-', ' ')}
                    </td>
                    <td className="px-5 py-3 text-ink-900">
                      {formatPrice(p.discountPrice ?? p.price)}
                    </td>
                    <td className="px-5 py-3">
                      {p.stock === 0 ? (
                        <Badge tone="danger">Out of stock</Badge>
                      ) : (
                        <Badge tone="warning">{p.stock} left</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              {products.filter((p) => p.stock <= 5).length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-ink-500"
                  >
                    All good — nothing running low.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  tone: 'brand' | 'emerald' | 'amber' | 'rose' | 'ink'
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    ink: 'bg-ink-100 text-ink-700',
  }
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </p>
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{hint}</p>
    </div>
  )
}

function OrderBadge({ status }: { status: Order['status'] }) {
  const map: Record<
    Order['status'],
    'default' | 'success' | 'info' | 'warning' | 'danger'
  > = {
    pending: 'warning',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger',
  }
  return <Badge tone={map[status]}>{status}</Badge>
}
