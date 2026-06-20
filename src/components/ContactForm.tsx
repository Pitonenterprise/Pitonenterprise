'use client'

import { useState } from 'react'

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send message')
      setStatus('sent')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError((err as Error).message)
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-sm border border-line bg-white/50 p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-wine text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-display text-2xl text-foreground">Thank you</h3>
        <p className="mt-2 text-sm text-muted">
          Your message has reached us — we&apos;ll get back to you shortly.
        </p>
        <button onClick={() => setStatus('idle')} className="mt-5 text-sm text-wine underline">
          Send another
        </button>
      </div>
    )
  }

  const input = 'h-12 w-full rounded-sm border border-foreground/20 bg-white/50 px-4 text-sm focus:border-wine'

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder="Your name" value={form.name} onChange={set('name')} className={input} />
        <input required type="email" placeholder="Email" value={form.email} onChange={set('email')} className={input} />
        <input placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} className={input} />
        <input placeholder="Subject (optional)" value={form.subject} onChange={set('subject')} className={input} />
      </div>
      <textarea
        required
        placeholder="How can we help?"
        value={form.message}
        onChange={set('message')}
        rows={6}
        className="w-full rounded-sm border border-foreground/20 bg-white/50 px-4 py-3 text-sm focus:border-wine"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-full bg-wine px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
