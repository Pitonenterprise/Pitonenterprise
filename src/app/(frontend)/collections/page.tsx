import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCollections } from '@/lib/queries'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Shop our curated collections — festive, bridal, seasonal edits and more.',
  alternates: { canonical: '/collections' },
}

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12 md:px-8">
      <header className="mb-10 border-b border-line pb-6">
        <p className="text-[11px] uppercase tracking-[4px] text-gold">Curated Edits</p>
        <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Collections</h1>
      </header>

      {collections.length === 0 ? (
        <p className="py-20 text-center text-muted">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-line/40">
                {c.image?.url ? (
                  <Image
                    src={c.image.url}
                    alt={c.image.alt || c.title}
                    width={768}
                    height={576}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: 'linear-gradient(150deg,#6e1f3b,#4a1228)' }} />
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-5">
                  <h2 className="font-display text-2xl text-white">{c.title}</h2>
                </div>
              </div>
              {c.description && <p className="mt-2 text-sm text-muted">{c.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
