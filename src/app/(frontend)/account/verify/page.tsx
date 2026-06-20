'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyInner() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''
  const devMode = params.get('dev') === '1'

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const code = digits.join('')

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '')
    if (!clean && v !== '') return
    setDigits((prev) => {
      const next = [...prev]
      if (clean.length > 1) {
        // pasted full code
        clean.split('').slice(0, 6).forEach((c, idx) => (next[idx] = c))
        return next
      }
      next[i] = clean
      return next
    })
    if (clean && i < 5) inputs.current[i + 1]?.focus()
  }

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (code.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      router.push(`/account/login?verified=1&email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setError(null)
    setInfo(null)
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => ({}))
    setCooldown(30)
    setInfo(data.emailConsoleOnly ? 'New code generated (check the server console, dev mode).' : 'A new code is on its way.')
  }

  return (
    <main className="mx-auto max-w-[440px] px-6 py-20 text-center">
      <h1 className="font-display text-4xl text-foreground">Verify your email</h1>
      <p className="mt-3 text-sm text-muted">
        We sent a 6-digit code to <span className="text-foreground">{email || 'your email'}</span>.
      </p>
      {devMode && (
        <p className="mt-2 rounded-sm bg-gold-soft/40 px-3 py-2 text-xs text-wine">
          Dev mode: no email service configured yet, the code is printed in the server console.
        </p>
      )}

      <form onSubmit={submit} className="mt-8">
        <div className="flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              maxLength={6}
              className="h-14 w-12 rounded-sm border border-foreground/20 bg-white/50 text-center text-2xl focus:border-wine"
            />
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {info && <p className="mt-4 text-sm text-wine">{info}</p>}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="mt-6 w-full rounded-full bg-wine py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      <button
        onClick={resend}
        disabled={cooldown > 0}
        className="mt-5 text-sm text-muted underline transition hover:text-wine disabled:no-underline disabled:opacity-60"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
      </button>
      <div className="mt-2">
        <Link href="/account/login" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-wine">
          Back to sign in
        </Link>
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="px-6 py-20 text-center text-muted">Loading…</main>}>
      <VerifyInner />
    </Suspense>
  )
}
