import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { AdminLogin } from "./AdminLogin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdmin();
  if (!ok) return <AdminLogin />;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-8 border-b border-black/10 pb-4">
        <h1 className="serif text-2xl text-[var(--brand)]">Admin</h1>
        <nav className="flex gap-5 text-sm">
          <Link href="/admin" className="hover:text-[var(--brand)]">Dashboard</Link>
          <Link href="/admin/products" className="hover:text-[var(--brand)]">Products</Link>
          <Link href="/admin/orders" className="hover:text-[var(--brand)]">Orders</Link>
          <Link href="/admin/chats" className="hover:text-[var(--brand)]">Chats</Link>
          <form action="/api/admin/logout" method="POST">
            <button className="hover:text-[var(--brand)]">Logout</button>
          </form>
        </nav>
      </div>
      {children}
    </div>
  );
}
