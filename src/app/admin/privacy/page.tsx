import { AdminPoliciesForm } from '@/components/admin/AdminPoliciesForm'

export const metadata = {
  title: 'Privacy Policy | Admin',
}

export default function Page() {
  return <AdminPoliciesForm defaultTab="privacy" />
}

