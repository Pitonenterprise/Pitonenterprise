'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/components/providers/StoreProvider'

function LoginInner() {
  const router = useRouter()
  const { refreshAccountSync } = useStore()
  const params = useSearchParams()
  const justVerified = params.get('verified') === '1'
  const redirectTo = params.get('redirect') || '/account'
  const [email, setEmail] = useState(params.get('email') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.errors?.[0]?.message || ''
        if (msg.includes('ACCOUNT_NOT_VERIFIED')) {
          // Trigger a fresh code and send them to verify.
          await fetch('/api/auth/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          router.push(`/account/verify?email=${encodeURIComponent(email)}&dev=1`)
          return
        }
        throw new Error('Invalid email or password')
      }
      await refreshAccountSync() // merge account cart/wishlist into the session
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const input = 'h-12 w-full rounded-sm border border-foreground/20 bg-white/50 px-4 text-sm focus:border-wine'

  return (
    <main className="mx-auto max-w-[420px] px-6 py-20">
      <h1 className="text-center font-display text-4xl text-foreground">Sign in</h1>
      {justVerified && (
        <p className="mt-4 rounded-sm bg-gold-soft/40 px-3 py-2 text-center text-sm text-wine">
          Email verified, please sign in.
        </p>
      )}
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-full bg-wine py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{' '}
        <Link href="/account/register" className="text-wine underline">Create an account</Link>
      </p>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="px-6 py-20 text-center text-muted">Loading…</main>}>
      <LoginInner />
    </Suspense>
  )
}
