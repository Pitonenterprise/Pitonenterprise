'use client'

import { useRouter } from 'next/navigation'
import { useStore } from './providers/StoreProvider'

export function LogoutButton() {
  const router = useRouter()
  const { detachAccount } = useStore()
  const logout = async () => {
    await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
    detachAccount() // stop syncing + clear local (it's saved in the account)
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
