import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function RootPage() {
  const session = await getSession()
  if (session?.companyId) redirect('/dashboard')
  if (session) redirect('/onboarding')
  redirect('/login')
}
