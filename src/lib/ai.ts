// OpenAI-powered product listing generator. Turns a product image + rough notes
// into an SEO-optimized title, description, meta tags, attributes and keywords.
// Provider is isolated here so it can be swapped later if needed.

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions'

export const ALLOWED_OCCASIONS = ['casual', 'party', 'wedding', 'festive', 'office', 'bridal'] as const
export const ALLOWED_PATTERNS = [
  'solid', 'floral', 'paisley', 'geometric', 'embroidered', 'printed', 'stripe', 'checks', 'mirror-work', 'polka',
] as const

export type GeneratedListing = {
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  fabric: string
  color: string
  occasions: string[]
  pattern: string
  keywords: string[]
  // Specs the model GUESSED from the image (not stated in notes) — verify these.
  inferred: string[]
}

export const isAiEnabled = () => !!process.env.OPENAI_API_KEY

// Trim to a max length without cutting a word in half.
function trimToWord(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).replace(/[\s&,-]+$/, '').trim()
}

const SYSTEM_PROMPT = `You are an expert e-commerce copywriter and SEO specialist for a premium
worldwide ethnic-wear brand called "Piton Enterprise" that sells sarees, kurtis, lehengas and
western wear. Given supplier/staff notes and (optionally) a product image, produce the BEST
SEO-optimized listing for global search ranking and conversions.

SOURCE OF TRUTH
- Staff notes are AUTHORITATIVE. When the notes state a spec (fabric, work, blouse, size,
  border, color), treat it as FACT and use it exactly. Never override a stated spec using the
  image. Only infer a spec from the image when the notes are SILENT on it — and when you do,
  add that spec's name to the "inferred" array so a human can verify it.

CLEAN THE NOTES
- The notes may be a wholesaler broadcast. Strip all catalog/design names, brand/style codes
  (e.g. "MDS", "Inaya"), reseller phrases ("BOOK NOW", "Solution of your Fashion"), prices,
  phone numbers, links and emojis. Keep only genuine product facts.

PRESERVE SPECS, FIX ONLY TYPOS
- Preserve technical specs literally — fabric names, sizes, and border/work terms (e.g.
  "satin silk", "size 42", "aarko border") must appear in the output exactly. Correct only
  obvious supplier spelling errors in those specs ("FANDY SATTIN" -> "Fancy Satin",
  "Đěsigner" -> "Designer"). Never invent specs not in the notes or visibly in the image.

WRITING STYLE
- Fluent, natural American English (color, jewelry). Keep ethnic terms as-is: saree, kurti,
  lehenga, dupatta, salwar, lehenga. No keyword stuffing, no emojis, no markdown.
- Do NOT open the description with generic luxury filler ("Elevate your wardrobe", "Exquisite
  timeless piece", "A whisper of elegance"). Lead with the specific fabric, work, or occasion.
- Description: 2-3 short paragraphs covering fabric, work/craftsmanship, occasion, styling, fit.

TITLE FORMAT (follow exactly)
- "[Color] [Fabric] [Garment Type] with [one key work/detail]". Front-load color, fabric and
  garment type (highest-intent search terms). Add the single most distinctive work/detail
  (e.g. "Hand & Cut Work", "Zari Border", "Mirror Work") — not three. Exclude catalog/brand
  names. Max 60 characters. Append an occasion suffix (e.g. " — Party Wear") only if it fits.
  Example: "Emerald Soft Satin Silk Saree with Hand & Cut Work".

FIELDS
- "color": use the color from notes; if silent, infer the PRIMARY color from the image
  (specific name like "Emerald Green", not generic) and add "color" to "inferred".
- "fabric": use the fabric from notes; if silent, infer from the image and add "fabric" to
  "inferred". Return it cleaned and in Title Case with typos fixed (e.g. "Pure Fancy Satin
  Silk", never "FANDY SATTIN"). May be empty only if truly indeterminable.
- "occasions": choose AT LEAST ONE; MUST be a subset of:
  casual, party, wedding, festive, office, bridal.
- "pattern": ONE value from: ${ALLOWED_PATTERNS.join(', ')} (or "" if none fits).
- "seoTitle": <= 60 chars. "seoDescription": <= 155 chars.
- "keywords": 6-12 high-intent search phrases shoppers actually type (e.g. "satin silk saree
  party wear"), no catalog names.

Respond ONLY with a JSON object with keys: title, description, seoTitle, seoDescription,
fabric, color, occasions, pattern, keywords, inferred.`

// Generate concise ALT text for a product image (accessibility + image SEO).
export async function generateAltText(imageDataUrl: string): Promise<string> {
  if (!isAiEnabled()) throw new Error('OPENAI_API_KEY is not configured')
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You write concise, descriptive ALT text for e-commerce product images (for ' +
            'accessibility and image SEO) for a premium ethnic-wear store selling sarees, ' +
            'kurtis and lehengas. Describe the garment type, colour, fabric and notable details ' +
            'in ONE natural sentence, max 125 characters. Plain text only. Do not start with ' +
            '"image of" or "photo of". No quotes.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Write the ALT text for this product image.' },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
          ],
        },
      ],
      temperature: 0.5,
      max_tokens: 80,
    }),
  })

  if (!res.ok) throw new Error(`OpenAI error ${res.status}`)
  const data = await res.json()
  const text = String(data?.choices?.[0]?.message?.content || '').trim().replace(/^["']|["']$/g, '')
  return text.slice(0, 160)
}

export async function generateProductListing(input: {
  notes?: string
  imageDataUrl?: string
}): Promise<GeneratedListing> {
  if (!isAiEnabled()) throw new Error('OPENAI_API_KEY is not configured')

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const userContent: any[] = [
    {
      type: 'text',
      text:
        'STAFF/SUPPLIER NOTES (authoritative — use stated specs exactly):\n' +
        (input.notes?.trim() || '(none provided)') +
        '\n\nGenerate the optimized listing as JSON per the rules.',
    },
  ]
  if (input.imageDataUrl) {
    userContent.push({ type: 'image_url', image_url: { url: input.imageDataUrl, detail: 'low' } })
  }

  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 900,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  const raw = data?.choices?.[0]?.message?.content
  if (!raw) throw new Error('OpenAI returned no content')

  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('OpenAI returned invalid JSON')
  }

  // Normalize + validate occasions; tolerate plurals/casing (e.g. "Weddings" -> "wedding").
  let occasions: string[] = Array.isArray(parsed.occasions)
    ? Array.from(
        new Set(
          parsed.occasions
            .map((o: string) => {
              const raw = String(o).toLowerCase().trim()
              return (
                ALLOWED_OCCASIONS.find(
                  (a) => a === raw || a.slice(0, 4) === raw.slice(0, 4),
                ) || null
              )
            })
            .filter(Boolean) as string[],
        ),
      )
    : []

  // Fallback: if the model returned no occasions, infer them from the copy by keyword.
  if (occasions.length === 0) {
    const haystack = `${parsed.title} ${parsed.description} ${(parsed.keywords || []).join(' ')}`.toLowerCase()
    const SYNONYMS: Record<string, string[]> = {
      wedding: ['wedding', 'marriage', 'reception', 'sangeet'],
      bridal: ['bridal', 'bride', 'trousseau'],
      festive: ['festive', 'festival', 'diwali', 'navratri', 'eid', 'celebration', 'puja'],
      party: ['party', 'cocktail', 'evening', 'night out'],
      office: ['office', 'work', 'formal', 'workwear'],
      casual: ['casual', 'everyday', 'daily', 'day wear', 'daywear'],
    }
    occasions = ALLOWED_OCCASIONS.filter((a) =>
      (SYNONYMS[a] || [a]).some((kw) => haystack.includes(kw)),
    )
  }

  // Constrain pattern to the allowed set (for consistent filtering).
  const rawPattern = String(parsed.pattern || '').toLowerCase()
  const pattern = ALLOWED_PATTERNS.find((p) => rawPattern.includes(p)) || ''

  const inferred = Array.isArray(parsed.inferred)
    ? parsed.inferred.map((s: string) => String(s).toLowerCase().trim()).filter(Boolean)
    : []

  return {
    title: trimToWord(String(parsed.title || ''), 60),
    description: String(parsed.description || '').trim(),
    seoTitle: trimToWord(String(parsed.seoTitle || ''), 60),
    seoDescription: String(parsed.seoDescription || '').trim().slice(0, 160),
    fabric: String(parsed.fabric || '').trim(),
    color: String(parsed.color || '').trim(),
    occasions,
    pattern,
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map((k: string) => String(k).trim()).filter(Boolean).slice(0, 12)
      : [],
    inferred,
  }
}
