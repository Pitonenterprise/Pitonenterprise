import Link from "next/link";
import { STORE_NAME } from "@/lib/config";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <Link href="/" className="serif text-2xl text-[var(--brand)]">
          {STORE_NAME}
        </Link>
        <h1 className="serif text-3xl mt-6">{title}</h1>
        {subtitle && (
          <p className="text-sm text-black/55 mt-2">{subtitle}</p>
        )}
      </div>
      <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
        {children}
      </div>
      {footer && (
        <p className="text-center text-sm text-black/60 mt-6">{footer}</p>
      )}
    </div>
  );
}

export const authInput =
  "w-full px-4 py-3 rounded-lg border border-black/15 focus:border-[var(--brand)] focus:outline-none text-sm";
