import type { Metadata } from 'next'
import { Marcellus, Jost } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { StoreProvider } from '@/components/providers/StoreProvider'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

// Design system fonts, Marcellus (display serif) + Jost (body sans).
const marcellus = Marcellus({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

const jost = Jost({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Piton Enterprise'
const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${storeName}, Handcrafted Sarees, Kurtis & Lehengas`,
    template: `%s, ${storeName}`,
  },
  description:
    'Discover handcrafted sarees, kurtis, lehengas and western wear. Worldwide shipping, premium fabrics, timeless designs.',
  openGraph: {
    type: 'website',
    siteName: storeName,
  },
}

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${marcellus.variable} ${jost.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <GoogleAnalytics />
        <StoreProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  )
}
