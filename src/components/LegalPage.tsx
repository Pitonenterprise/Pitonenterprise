export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated?: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto max-w-[800px] px-6 py-16 md:px-8">
      <header className="mb-10 border-b border-line pb-6">
        <p className="text-[11px] uppercase tracking-[4px] text-gold">Piton Enterprise</p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{title}</h1>
        {updated && <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>}
      </header>
      <div className="space-y-4 [&_a]:text-wine [&_a]:underline [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_li]:leading-[1.7] [&_li]:text-foreground/75 [&_p]:leading-[1.9] [&_p]:text-foreground/75 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </main>
  )
}
