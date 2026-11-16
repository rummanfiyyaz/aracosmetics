import { AdminSupportForm } from '@/components/admin/AdminSupportForm'

export const metadata = {
  title: 'Shipping Policy | Admin',
}

export default function Page() {
  return <AdminSupportForm defaultTab="shipping" />
}

