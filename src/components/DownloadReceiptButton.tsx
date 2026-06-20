'use client'

export function DownloadReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-foreground/20 px-6 py-3 text-[12px] uppercase tracking-[1.5px] text-foreground transition hover:border-wine hover:text-wine print:hidden"
    >
      ⬇ Download Receipt
    </button>
  )
}
