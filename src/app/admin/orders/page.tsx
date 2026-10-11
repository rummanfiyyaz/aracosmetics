import { listOrders } from '@/lib/db'
import { OrdersTable } from '@/components/admin/OrdersTable'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const orders = await listOrders()
  return <OrdersTable orders={orders} />
}
