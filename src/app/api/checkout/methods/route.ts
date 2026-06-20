import { NextResponse } from 'next/server'
import { enabledMethods } from '@/lib/payments'

// Lets the checkout UI show only the payment methods that are actually configured.
export async function GET() {
  return NextResponse.json({ methods: enabledMethods() })
}
