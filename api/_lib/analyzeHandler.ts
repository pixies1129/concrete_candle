import type { ProductAnalysis } from '../../src/types'
import { HttpError } from './httpJson'
import { analyzeProductWithGemini } from './gemini'

interface AnalyzeRequestBody {
  imageBase64?: string
  imageMimeType?: string
}

const ANALYSIS_PROMPT = `You are analyzing a photo of a handmade candle product for an e-commerce listing.
Return ONLY compact JSON (no markdown fences) with exactly these keys:
{
  "productType": string,
  "containerShape": string,
  "dominantColors": string[],
  "hasLabel": boolean,
  "hasLogo": boolean,
  "notableFeatures": string[]
}
Describe only what is visibly true in the photo. Do not invent certifications, ingredients, or claims.`

const FALLBACK_ANALYSIS: ProductAnalysis = {
  productType: 'candle',
  containerShape: 'unknown',
  dominantColors: [],
  hasLabel: false,
  hasLogo: false,
  notableFeatures: [],
}

export async function handleAnalyze(body: AnalyzeRequestBody): Promise<ProductAnalysis> {
  if (!body?.imageBase64 || !body?.imageMimeType) {
    throw new HttpError(400, '제품 사진이 필요합니다.')
  }

  const text = await analyzeProductWithGemini({
    imageBase64: body.imageBase64,
    imageMimeType: body.imageMimeType,
    prompt: ANALYSIS_PROMPT,
  })

  try {
    const parsed = JSON.parse(text)
    return { ...FALLBACK_ANALYSIS, ...parsed }
  } catch {
    return FALLBACK_ANALYSIS
  }
}
