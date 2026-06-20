'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const logout = async () => {
    await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
    router.push('/')
    router.refresh()
  }
  return (
    <button
      onClick={logout}
      className="text-[12px] uppercase tracking-[1.5px] text-muted underline transition hover:text-wine"
    >
      Sign out
    </button>
  )
}
