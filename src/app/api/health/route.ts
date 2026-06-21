import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// Lightweight health check that performs a real DB read. Used by the daily
// keep-alive GitHub Action so the free Supabase project never pauses.
export const dynamic = 'force-dynamic' // never cache — always touch the database

export async function GET() {
  try {
    const payload = await getPayloadClient()
    await payload.find({ collection: 'products', limit: 1, depth: 0, overrideAccess: true })
    return NextResponse.json({ ok: true, ts: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
