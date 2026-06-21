import Link from 'next/link'
import { CartBadge } from './CartBadge'
import { CurrencySwitcher } from './CurrencySwitcher'

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Sarees', href: '/products/category/sarees' },
  { label: 'Kurtis', href: '/products/category/kurtis' },
  { label: 'Lehengas', href: '/products/category/lehengas' },
  { label: 'Western', href: '/products/category/western' },
]


function IconButton({
  label,
  href,
  children,
}: {
  label: string
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="text-foreground/80 transition hover:text-wine"
    >
      {children}
    </Link>
  )
}

export function Header() {
  return (
    <>
      {/* Announcement bar */}
      <div className="bg-wine-deep px-4 py-[9px] text-center text-[11.5px] uppercase tracking-[2.5px] text-gold-soft print:hidden">
        Festive Edit is live · Worldwide shipping · Easy 7-day returns
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-line bg-[rgba(247,241,232,0.92)] backdrop-blur-[10px] print:hidden">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 items-center gap-6 px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:px-8">
          {/* Left nav (desktop) */}
          <nav className="hidden items-center gap-[26px] md:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[12.5px] uppercase tracking-[1.5px] text-foreground transition hover:text-wine"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logo (centered) */}
          <Link href="/" className="text-center leading-none md:justify-self-center">
            <div className="font-display text-[27px] tracking-[1px] text-wine">Piton</div>
            <div className="mt-0.5 text-[9.5px] uppercase tracking-[5px] text-gold">
              Enterprise
            </div>
          </Link>

          {/* Right icons */}
          <div className="flex items-center justify-end gap-5">
            <CurrencySwitcher />
            <IconButton label="Search" href="/search">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
            </IconButton>
            <IconButton label="Account" href="/account">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </IconButton>
            <IconButton label="Wishlist" href="/wishlist">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 20S3.5 14.5 3.5 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8.5 2.8C20.5 14.5 12 20 12 20Z" strokeLinejoin="round" />
              </svg>
            </IconButton>
            <CartBadge />
          </div>
        </div>
      </header>
    </>
  )
}
