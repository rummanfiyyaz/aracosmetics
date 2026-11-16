import { AdminSupportForm } from '@/components/admin/AdminSupportForm'

export const metadata = {
  title: 'Order Help & Contact | Admin',
}

export default function Page() {
  return <AdminSupportForm defaultTab="contact" />
}

