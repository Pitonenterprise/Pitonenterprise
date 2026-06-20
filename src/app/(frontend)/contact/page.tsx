import type { Metadata } from 'next'
import { ContactForm } from '@/components/ContactForm'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Piton Enterprise, questions about our handcrafted sarees, kurtis and lehengas, orders, or visiting our shop.',
  alternates: { canonical: '/contact' },
}

async function getSettings() {
  try {
    const payload = await getPayloadClient()
    return (await payload.findGlobal({ slug: 'settings', overrideAccess: true })) as any
  } catch {
    return {}
  }
}

export default async function ContactPage() {
  const settings = await getSettings()
  const email = settings?.supportEmail || 'pitonenterprise3240@gmail.com'
  const whatsapp = settings?.whatsapp

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16 md:px-8">
      <header className="mb-12 text-center">
        <p className="text-[11px] uppercase tracking-[4px] text-gold">Contact Us</p>
        <h1 className="mt-4 font-display text-5xl text-foreground">We&apos;d love to hear from you</h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/70">
          Questions about a piece, your order, custom work, or visiting our shop, send us a note
          and our team will reply soon.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <aside className="space-y-8">
          <div>
            <h2 className="text-[11px] uppercase tracking-[3px] text-gold">Email</h2>
            <a href={`mailto:${email}`} className="mt-2 block text-sm text-foreground hover:text-wine">
              {email}
            </a>
          </div>
          {whatsapp && (
            <div>
              <h2 className="text-[11px] uppercase tracking-[3px] text-gold">WhatsApp</h2>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-sm text-foreground hover:text-wine"
              >
                {whatsapp}
              </a>
            </div>
          )}
          <div>
            <h2 className="text-[11px] uppercase tracking-[3px] text-gold">Our Shop</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              Visit our manufacturing unit &amp; retail shop to see the craft up close.
            </p>
          </div>
          <div>
            <h2 className="text-[11px] uppercase tracking-[3px] text-gold">Hours</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              Mon-Sat · 10am-7pm
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
