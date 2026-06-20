import { NextResponse } from 'next/server'

// Address autocomplete proxy. Uses Geoapify when GEOAPIFY_API_KEY is set (more reliable),
// otherwise falls back to the keyless Photon (OpenStreetMap) service. Normalizes both into
// a common shape so the client just fills the form.

export type AddressSuggestion = {
  label: string
  line1: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Map provider country names to our checkout dropdown's values.
const COUNTRY_ALIASES: Record<string, string> = {
  'united states of america': 'United States',
  usa: 'United States',
  'united states': 'United States',
  'united kingdom of great britain and northern ireland': 'United Kingdom',
  uk: 'United Kingdom',
  uae: 'United Arab Emirates',
  'czech republic': 'Czechia',
  türkiye: 'Turkey',
  "côte d'ivoire": 'Ivory Coast',
}
function normalizeCountry(name?: string): string {
  if (!name) return ''
  return COUNTRY_ALIASES[name.trim().toLowerCase()] || name
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim()
  if (!q || q.length < 3) return NextResponse.json({ suggestions: [] })

  const key = process.env.GEOAPIFY_API_KEY
  try {
    let suggestions: AddressSuggestion[] = []

    if (key) {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&limit=6&format=json&apiKey=${key}`
      const res = await fetch(url)
      const data = await res.json()
      suggestions = (data.results || []).map((r: any) => ({
        label: r.formatted || '',
        line1: r.address_line1 || [r.housenumber, r.street].filter(Boolean).join(' '),
        city: r.city || r.county || '',
        state: r.state || '',
        postalCode: r.postcode || '',
        country: normalizeCountry(r.country),
      }))
    } else {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6`
      const res = await fetch(url, { headers: { 'User-Agent': 'PitonEnterprise/1.0' } })
      const data = await res.json()
      suggestions = (data.features || []).map((f: any) => {
        const p = f.properties || {}
        const line1 = [p.housenumber, p.street].filter(Boolean).join(' ') || p.name || ''
        return {
          label: [p.name, p.street, p.city, p.state, p.postcode, p.country].filter(Boolean).join(', '),
          line1,
          city: p.city || p.district || '',
          state: p.state || '',
          postalCode: p.postcode || '',
          country: normalizeCountry(p.country),
        }
      })
    }

    // Drop empty/duplicate labels.
    const seen = new Set<string>()
    suggestions = suggestions.filter((s) => s.label && !seen.has(s.label) && seen.add(s.label))

    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
