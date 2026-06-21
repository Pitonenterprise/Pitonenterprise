import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Sarees', href: '/products/category/sarees' },
      { label: 'Kurtis', href: '/products/category/kurtis' },
      { label: 'Lehengas', href: '/products/category/lehengas' },
      { label: 'Western', href: '/products/category/western' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping & Returns', href: '/shipping' },
      { label: 'Track Order', href: '/account' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-24 bg-wine-deep text-gold-soft print:hidden">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-5 px-6 py-14 text-center md:px-8">
          <p className="text-[11px] uppercase tracking-[4px] text-gold">The Piton List</p>
          <h2 className="font-display text-3xl text-white">
            Be first to the next festive drop
          </h2>
          <p className="max-w-md text-sm text-gold-soft/70">
            Join for early access, styling notes and members-only offers.
          </p>
          <form className="mt-2 flex w-full max-w-md items-center gap-2">
            <input
              type="email"
              required
              placeholder="Your email address"
              className="h-12 flex-1 rounded-full border border-white/20 bg-white/5 px-5 text-sm text-white placeholder:text-gold-soft/50 focus:border-gold"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-gold px-7 text-[12px] font-medium uppercase tracking-[1.5px] text-wine-deep transition hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-10 px-6 py-14 md:grid-cols-4 md:px-8">
        <div>
          <div className="font-display text-2xl text-white">Piton</div>
          <div className="mt-1 text-[9.5px] uppercase tracking-[5px] text-gold">Enterprise</div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gold-soft/60">
            Handcrafted sarees, kurtis & lehengas, woven for women everywhere.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-[11px] uppercase tracking-[3px] text-gold">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gold-soft/75 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-6 text-[11px] uppercase tracking-[1.5px] text-gold-soft/50 md:flex-row md:px-8">
          <span>© {new Date().getFullYear()} Piton Enterprise. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/shipping" className="hover:text-white">Worldwide Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
