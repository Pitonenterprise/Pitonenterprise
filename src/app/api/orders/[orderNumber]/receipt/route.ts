import { getPayloadClient } from '@/lib/payload'
import { formatINR } from '@/lib/format'
import { paymentLabel, orderHeadline } from '@/lib/orderStatus'

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Returns a standalone, single-page HTML receipt (no site chrome) and auto-opens print.
export async function GET(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.collection !== 'customers') {
    return new Response('Please sign in to view this receipt.', { status: 401 })
  }

  const res = await payload.find({
    collection: 'orders',
    where: { and: [{ orderNumber: { equals: orderNumber } }, { email: { equals: (user as any).email } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const order: any = res.docs[0]
  if (!order) return new Response('Order not found.', { status: 404 })

  // Resolve product IDs (SKU) for each line item.
  const ids = (order.items || []).map((i: any) => i.product).filter(Boolean)
  const skuMap: Record<string, string> = {}
  if (ids.length) {
    const prods = await payload.find({ collection: 'products', where: { id: { in: ids } }, limit: 100, depth: 0, overrideAccess: true })
    prods.docs.forEach((p: any) => (skuMap[String(p.id)] = p.sku || ''))
  }

  const a = order.shippingAddress || {}
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const rows = (order.items || [])
    .map(
      (it: any) => `
      <tr>
        <td class="sku">${esc(skuMap[String(it.product)] || '—')}</td>
        <td>${esc(it.title)}${it.size ? ` <span class="muted">· ${esc(it.size)}</span>` : ''}</td>
        <td class="c">${esc(it.quantity)}</td>
        <td class="r">${esc(formatINR(it.unitPrice || 0))}</td>
        <td class="r">${esc(formatINR((it.unitPrice || 0) * (it.quantity || 1)))}</td>
      </tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Receipt ${esc(order.orderNumber)} — Piton Enterprise</title>
<style>
  *{box-sizing:border-box} body{margin:0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2a2320;background:#f5f3ef;padding:24px}
  .sheet{max-width:720px;margin:0 auto;background:#fff;padding:40px;border:1px solid #e7ddcc}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e7ddcc;padding-bottom:18px}
  .brand{font-family:Georgia,serif;font-size:24px;color:#6e1f3b}
  .brand small{display:block;font-family:inherit;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#b68a3e;margin-top:2px}
  .meta{text-align:right;font-size:13px;color:#6b6b6b}
  .meta strong{color:#2a2320}
  h2{font-family:Georgia,serif;font-size:20px;margin:18px 0 4px}
  .muted{color:#8a7d70}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}
  th,td{padding:8px 6px;border-bottom:1px solid #eee;text-align:left}
  th{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8a7d70}
  td.sku{font-family:ui-monospace,Menlo,monospace;color:#6e1f3b;white-space:nowrap}
  .c{text-align:center}.r{text-align:right;white-space:nowrap}
  .totals{margin-top:10px;margin-left:auto;width:260px;font-size:13px}
  .totals div{display:flex;justify-content:space-between;padding:3px 0}
  .totals .grand{border-top:1px solid #e7ddcc;margin-top:6px;padding-top:8px;font-size:15px;font-weight:600;color:#6e1f3b}
  .cols{display:flex;gap:32px;margin-top:24px;font-size:13px}
  .cols h3{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#b68a3e;margin:0 0 6px}
  address{font-style:normal;line-height:1.6}
  .foot{margin-top:28px;border-top:1px solid #e7ddcc;padding-top:14px;text-align:center;font-size:12px;color:#8a7d70}
  .actions{max-width:720px;margin:0 auto 14px;text-align:right}
  .actions button{background:#6e1f3b;color:#fff;border:0;border-radius:999px;padding:9px 18px;font-size:13px;cursor:pointer}
  @media print{ body{background:#fff;padding:0} .sheet{border:0;padding:24px} .actions{display:none} }
</style></head>
<body>
  <div class="actions"><button onclick="window.print()">⬇ Save as PDF / Print</button></div>
  <div class="sheet">
    <div class="top">
      <div class="meta" style="text-align:left"><strong>Receipt</strong> · ${esc(order.orderNumber)} · ${esc(date)}</div>
    </div>

    <h2>${esc(orderHeadline(order))}</h2>
    <div class="muted" style="font-size:13px">Payment: <strong>${esc(paymentLabel(order.paymentStatus, order.paymentProvider))}</strong></div>

    <table>
      <thead><tr><th>Product ID</th><th>Item</th><th class="c">Qty</th><th class="r">Unit</th><th class="r">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div><span class="muted">Subtotal</span><span>${esc(formatINR(order.subtotal || 0))}</span></div>
      <div><span class="muted">Shipping</span><span>${esc(formatINR(order.shipping || 0))}</span></div>
      ${order.tax ? `<div><span class="muted">Tax</span><span>${esc(formatINR(order.tax))}</span></div>` : ''}
      <div class="grand"><span>Total</span><span>${esc(formatINR(order.total || 0))}</span></div>
    </div>

    <div class="cols">
      <div>
        <h3>Shipping to</h3>
        <address>
          ${a.name ? esc(a.name) + '<br>' : ''}${a.line1 ? esc(a.line1) + '<br>' : ''}${a.line2 ? esc(a.line2) + '<br>' : ''}
          ${esc([a.city, a.state, a.postalCode].filter(Boolean).join(', '))}<br>${esc(a.country)}${a.phone ? '<br>' + esc(a.phone) : ''}
        </address>
      </div>
      <div>
        <h3>Billed to</h3>
        <address>${esc(order.email)}</address>
      </div>
    </div>

    <div class="foot">Thank you for shopping with Piton Enterprise.</div>
  </div>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print() }, 300) })</script>
</body></html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
