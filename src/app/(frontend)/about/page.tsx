import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Since 2006, Piton Enterprise has grown from a single artisan to a team of 50 skilled workers, with its own manufacturing unit and retail shop, handcrafting sarees, kurtis and lehengas.',
  alternates: { canonical: '/about' },
}

const STATS = [
  { value: '2006', label: 'Crafting since' },
  { value: '50+', label: 'Skilled artisans' },
]

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[820px] px-6 py-20 text-center md:px-8">
          <p className="text-[11px] uppercase tracking-[4px] text-gold">Our Story</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-foreground md:text-6xl">
            Woven with intent,<br /><span className="text-wine">grown with heart</span>
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-foreground/70">
            What began in 2006 as the work of a single pair of hands has become a house of
            craft, fifty skilled artisans, one dedicated manufacturing unit, and a shop where
            our pieces come to life for the women who wear them.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line bg-background">
        <div className="mx-auto grid max-w-[600px] grid-cols-2 gap-px">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-12 text-center">
              <div className="font-display text-4xl text-wine md:text-5xl">{s.value}</div>
              <div className="mt-2 text-[11px] uppercase tracking-[2px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Narrative */}
      <section className="mx-auto max-w-[760px] px-6 py-20 md:px-8">
        <div className="space-y-10">
          <div>
            <h2 className="font-display text-3xl text-foreground">A beginning in 2006</h2>
            <p className="mt-4 leading-[1.9] text-foreground/75">
              Piton Enterprise started in 2006 with a single employee and a simple belief, that
              a beautifully made garment carries the warmth of the hands that made it. In those
              early days, every saree was cut, finished and inspected by one person who cared
              about getting it right.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl text-foreground">From one to fifty</h2>
            <p className="mt-4 leading-[1.9] text-foreground/75">
              That care drew others to the craft. Over the years our small workshop became a
              team of fifty skilled workers, pattern makers, weavers, embroiderers and
              finishers, each adding their own mastery to the pieces that leave our doors.
              Growth never changed the standard: every order still passes through hands that
              take pride in it.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl text-foreground">A home for our craft</h2>
            <p className="mt-4 leading-[1.9] text-foreground/75">
              Today we work from our own manufacturing unit, with a retail shop where customers
              can see and feel the quality up close. From that single unit and shop, we now ship
              handcrafted sarees, kurtis and lehengas to women around the world, carrying a
              little of where we came from into everything we make.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-wine px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep"
          >
            Explore the Collection
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-foreground/20 px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-foreground transition hover:border-wine hover:text-wine"
          >
            Visit / Contact Us
          </Link>
        </div>
      </section>
    </main>
  )
}
