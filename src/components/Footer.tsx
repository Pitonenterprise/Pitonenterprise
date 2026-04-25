import Link from "next/link";
import { STORE_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[var(--muted)] mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="serif text-lg font-semibold text-[var(--brand)] mb-3">
            {STORE_NAME}
          </h4>
          <p className="text-black/60 leading-relaxed">
            Authentic handwoven sarees from across India. Worldwide shipping with care.
          </p>
        </div>
        <div>
          <h5 className="font-semibold mb-3">Shop</h5>
          <ul className="space-y-2 text-black/70">
            <li><Link href="/products?category=bridal">Bridal</Link></li>
            <li><Link href="/products?category=festive">Festive</Link></li>
            <li><Link href="/products?category=office">Office</Link></li>
            <li><Link href="/products">All Sarees</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-3">Help</h5>
          <ul className="space-y-2 text-black/70">
            <li><Link href="/account">My Orders</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/about#shipping">Shipping</Link></li>
            <li><Link href="/about#returns">Returns</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-3">Talk to us</h5>
          <p className="text-black/70 mb-2">
            Use the chat in the corner — our AI Saree Assistant is always available, and we&apos;re a tap away on WhatsApp.
          </p>
        </div>
      </div>
      <div className="border-t border-black/10 py-4 text-center text-xs text-black/50">
        © {new Date().getFullYear()} {STORE_NAME}. Handwoven with care.
      </div>
    </footer>
  );
}
