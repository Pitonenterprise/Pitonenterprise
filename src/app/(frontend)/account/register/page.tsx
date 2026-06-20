'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create account')
      // Move to OTP entry. (emailConsoleOnly tells us the code is in the dev log.)
      router.push(`/account/verify?email=${encodeURIComponent(form.email)}${data.emailConsoleOnly ? '&dev=1' : ''}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const input = 'h-12 w-full rounded-sm border border-foreground/20 bg-white/50 px-4 text-sm focus:border-wine'

  return (
    <main className="mx-auto max-w-[420px] px-6 py-20">
      <h1 className="text-center font-display text-4xl text-foreground">Create account</h1>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="First name" value={form.firstName} onChange={set('firstName')} className={input} />
          <input placeholder="Last name" value={form.lastName} onChange={set('lastName')} className={input} />
        </div>
        <input required type="email" placeholder="Email" value={form.email} onChange={set('email')} className={input} />
        <input required type="password" placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={set('password')} className={input} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-full bg-wine py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep disabled:opacity-60">
          {loading ? 'Sending code…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/account/login" className="text-wine underline">Sign in</Link>
      </p>
    </main>
  )
}
