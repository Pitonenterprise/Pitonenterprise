import Link from "next/link";
import { CartBadge } from "@/components/CartBadge";
import { STORE_NAME } from "@/lib/config";
import { getCurrentUser } from "@/lib/supabase-auth";

export async function Header() {
  const user = await getCurrentUser().catch(() => null);
  const fullName = (user?.user_metadata?.full_name as string | undefined) || "";
  const firstName = fullName.split(" ")[0];

  return (
    <header className="border-b border-black/10 bg-[var(--background)]/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="serif text-2xl font-semibold text-[var(--brand)]">
            {STORE_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <Link href="/products" className="hover:text-[var(--brand)]">All Sarees</Link>
            <Link href="/products?category=bridal" className="hover:text-[var(--brand)]">Bridal</Link>
            <Link href="/products?category=festive" className="hover:text-[var(--brand)]">Festive</Link>
            <Link href="/products?category=casual" className="hover:text-[var(--brand)]">Daily Wear</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="hidden sm:inline px-3 py-2 text-sm font-medium hover:text-[var(--brand)]"
                >
                  Hi{firstName ? `, ${firstName}` : ""}
                </Link>
                <form action="/auth/signout" method="POST">
                  <button className="text-sm text-black/55 hover:text-[var(--brand)] px-2">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium hover:text-[var(--brand)] px-3 py-2"
              >
                Sign in
              </Link>
            )}
            <CartBadge />
          </div>
        </div>
      </div>
    </header>
  );
}
