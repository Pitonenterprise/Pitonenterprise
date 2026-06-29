import Link from 'next/link'
import { CartBadge } from './CartBadge'
import { CurrencySwitcher } from './CurrencySwitcher'
import { getCategories, getCollections } from '@/lib/queries'

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

const linkClass =
  'text-[12.5px] uppercase tracking-[1.5px] text-foreground transition hover:text-wine'

// A top-level nav item that reveals a list of links on hover/focus (CSS only).
// The trigger itself is a real link (e.g. "Shop" -> /products).
function NavDropdown({
  label,
  href,
  items,
}: {
  label: string
  href: string
  items: { label: string; href: string }[]
}) {
  if (items.length === 0) {
    return (
      <Link href={href} className={linkClass}>
        {label}
      </Link>
    )
  }
  return (
    <div className="group relative">
      <Link href={href} className={`${linkClass} inline-flex items-center gap-1`} aria-haspopup="true">
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="mt-0.5 transition group-hover:rotate-180"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* pt-3 bridges the gap so the menu stays open while moving the cursor down */}
      <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="min-w-[230px] overflow-hidden rounded-md border border-line bg-background py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="block px-5 py-2.5 text-[12.5px] tracking-[0.5px] text-foreground transition hover:bg-gold-soft/40 hover:text-wine"
            >
              {it.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export async function Header() {
  // Categories + collections are pulled live from the CMS, so the nav always matches the store.
  const [categories, collections] = await Promise.all([getCategories(), getCollections()])

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
            <Link href="/" className={linkClass}>
              Home
            </Link>

            <NavDropdown
              label="Shop"
              href="/products"
              items={categories.map((c) => ({
                label: c.title,
                href: `/products/category/${c.slug}`,
              }))}
            />

            <NavDropdown
              label="Collections"
              href="/collections"
              items={collections.map((c) => ({
                label: c.title,
                href: `/collections/${c.slug}`,
              }))}
            />

            <Link href="/about" className={linkClass}>
              About
            </Link>
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
