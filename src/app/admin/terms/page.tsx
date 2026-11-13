import { AdminPoliciesForm } from '@/components/admin/AdminPoliciesForm'

export const metadata = {
  title: 'Terms of Service | Admin',
}

export default function Page() {
  return <AdminPoliciesForm defaultTab="terms" />
}

