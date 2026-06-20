// OpenAI-powered product listing generator. Turns a product image + rough notes
// into an SEO-optimized title, description, meta tags, attributes and keywords.
// Provider is isolated here so it can be swapped later if needed.

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions'

export const ALLOWED_OCCASIONS = ['casual', 'party', 'wedding', 'festive', 'office', 'bridal'] as const

export type GeneratedListing = {
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  fabric: string
  color: string
  occasions: string[]
  pattern: string
  badge: string
  keywords: string[]
}

export const isAiEnabled = () => !!process.env.OPENAI_API_KEY

const SYSTEM_PROMPT = `You are an expert e-commerce copywriter and SEO specialist for a premium
worldwide ethnic-wear brand called "Piton Enterprise" that sells sarees, kurtis, lehengas and
western wear. Given a product image and/or rough notes from staff, produce the BEST possible
SEO-optimized listing for global search ranking and conversions.

Rules:
- Write in fluent, elegant, natural English. No keyword stuffing, no emojis.
- The title must be concise, specific and keyword-rich (max ~70 chars).
- The description must be 2-3 short paragraphs: highlight fabric, craftsmanship, occasion,
  styling and fit. Persuasive but honest. Plain text only (no markdown).
- seoTitle <= 60 chars, seoDescription <= 155 chars.
- "color": ALWAYS identify the garment's PRIMARY colour by looking at the image (e.g.
  "Emerald Green", "Maroon", "Ivory", "Royal Blue"). When an image is provided, colour MUST
  NOT be empty. Use a specific, natural colour name, not a generic one.
- "fabric": identify the most likely fabric from the image and/or notes (e.g. "Silk",
  "Georgette", "Chiffon", "Cotton", "Banarasi Silk"). Do not leave empty if it can be inferred.
- "occasions": choose AT LEAST ONE best-fitting value; MUST be a subset of:
  casual, party, wedding, festive, office, bridal.
- "badge" is a short tag like "New", "Bestseller", "Bridal", "Limited" or "" if none fits.
- "keywords" is 6-12 high-intent search keywords/phrases shoppers would use.
- If the image and notes conflict, prefer what you can see in the image.
Respond ONLY with a JSON object with keys: title, description, seoTitle, seoDescription,
fabric, color, occasions, pattern, badge, keywords.`

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
        (input.notes?.trim() || 'No notes provided.') +
        '\n\nGenerate the optimized listing as JSON.',
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

  return {
    title: String(parsed.title || '').trim(),
    description: String(parsed.description || '').trim(),
    seoTitle: String(parsed.seoTitle || '').trim().slice(0, 70),
    seoDescription: String(parsed.seoDescription || '').trim().slice(0, 180),
    fabric: String(parsed.fabric || '').trim(),
    color: String(parsed.color || '').trim(),
    occasions,
    pattern: String(parsed.pattern || '').trim(),
    badge: String(parsed.badge || '').trim().slice(0, 24),
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map((k: string) => String(k).trim()).filter(Boolean).slice(0, 12)
      : [],
  }
}
