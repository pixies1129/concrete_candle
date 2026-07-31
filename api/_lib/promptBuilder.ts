const PRESERVATION_BASE_PROMPT = `Use the uploaded product photo as the exact product reference.
Preserve the exact product geometry, proportions, material, texture, label, logo, typography, candle wax color, wick and container shape.
Do not redesign, replace, distort, repaint, relabel or reinterpret the product in any way.
Only change the environment, background, lighting, shadows and surrounding props.
Create a premium commercial product photography scene.`

const CONCEPT_PROMPTS: Record<string, string> = {
  minimal:
    'Minimal studio look: seamless white or soft beige backdrop, soft diffused light, gentle contact shadow only, generous negative space, nothing but the product in frame.',
  luxury:
    'Luxury hotel-suite look: polished marble surface, warm ambient light, soft background bokeh, subtle gold or brass accents, five-star premium atmosphere.',
  natural:
    'Natural light look: raw light wood surface, a few green plant leaves nearby, soft daylight from a window, warm organic mood.',
  cozy: 'Cozy bedroom look: soft neutral knit fabric, a small stack of books nearby, warm golden-hour lamp light, intimate comfortable mood.',
  concrete:
    'Architectural concrete look: raw concrete or cement surface and backdrop, industrial minimalist mood, directional hard light with soft-edged shadows.',
  'dark-mood':
    'Dark moody studio look: near-black background, single-source dramatic side lighting, strong contrast, deep shadows, high-end editorial mood.',
  'korean-minimal':
    'Korean minimal interior look: light wood and warm off-white tones, generous negative space (yeobaek), natural linen or ceramic elements, quiet refined mood.',
  seasonal: 'Seasonal editorial look, styled around the specified season or holiday below.',
}

const SEASON_PROMPTS: Record<string, string> = {
  spring: 'Add soft spring accents: cherry-blossom petals or pastel flowers, fresh light pastel palette.',
  summer: 'Add bright summer accents: crisp natural light, hints of greenery, airy fresh atmosphere.',
  autumn: 'Add autumn accents: warm amber tones, dried leaves or pampas grass, cozy fall mood.',
  winter: 'Add winter accents: cool soft light, a hint of frost or knit texture, quiet wintry mood.',
  christmas: 'Add understated Christmas accents: pine branches, warm fairy lights, deep red and green tones.',
  valentine: "Add Valentine's Day accents: soft red or blush tones, a few rose petals, romantic warm light.",
  'parents-day': "Add Parents' Day accents: a small bouquet of carnations, warm respectful tone, gentle light.",
}

const TARGET_PROMPTS: Record<string, string> = {
  'smartstore-main':
    'Composition: product centered in frame, clean and simple, minimal shadow, no busy props, e-commerce thumbnail style.',
  'detail-page':
    'Composition: editorial product-detail shot suitable for an e-commerce detail page, natural framing with breathing room around the product.',
  'instagram-feed': 'Composition: aesthetically pleasing social feed photo, balanced framing, lifestyle feel.',
  'instagram-story':
    'Composition: vertical full-bleed framing for a mobile story, product placed off-center leaving clear space near the top or bottom for text overlay.',
  'brand-editorial': 'Composition: high-fashion editorial brand photography, artistic framing, storytelling mood.',
}

const PROP_LABELS: Record<string, string> = {
  book: 'a book',
  flower: 'fresh flowers',
  wood: 'natural wood texture',
  stone: 'natural stones',
  fabric: 'draped fabric',
  tray: 'a ceramic or wooden tray',
  coffee: 'a cup of coffee',
  perfume: 'a perfume bottle',
}

interface PromptInput {
  target: string
  aspectRatio: string
  concept: string
  season?: string
  props: string[]
}

export function buildGenerationPrompt(input: PromptInput): string {
  const lines = [PRESERVATION_BASE_PROMPT]

  lines.push(CONCEPT_PROMPTS[input.concept] ?? `Style concept: ${input.concept}.`)

  if (input.concept === 'seasonal' && input.season) {
    lines.push(SEASON_PROMPTS[input.season] ?? `Seasonal theme: ${input.season}.`)
  }

  lines.push(TARGET_PROMPTS[input.target] ?? `Output target: ${input.target}.`)
  lines.push(`Frame the final image for a ${input.aspectRatio} aspect ratio.`)

  const propNames = input.props.filter((p) => p !== 'none').map((p) => PROP_LABELS[p] ?? p)
  lines.push(
    propNames.length
      ? `Include subtle, tasteful props placed naturally near the product: ${propNames.join(', ')}. The props must not cover or overlap the product.`
      : 'Keep the scene clean with no extra props.',
  )

  return lines.join('\n')
}
