import { HttpError } from './httpJson.js'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const IMAGE_MODEL = 'gemini-2.5-flash-image'
const VISION_MODEL = 'gemini-flash-latest'

interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new HttpError(500, 'GEMINI_API_KEY가 설정되지 않았습니다. .env.local에 키를 추가해주세요.')
  }
  return key
}

async function callGemini(model: string, parts: GeminiPart[], generationConfig?: Record<string, unknown>) {
  const apiKey = getApiKey()
  const res = await fetch(`${API_BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      ...(generationConfig ? { generationConfig } : {}),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new HttpError(res.status === 429 ? 429 : 502, `Gemini API 오류 (${res.status}): ${text.slice(0, 300)}`)
  }

  return res.json() as Promise<{
    candidates?: { content?: { parts?: GeminiPart[] } }[]
  }>
}

export async function generateImageWithGemini(params: {
  imageBase64: string
  imageMimeType: string
  prompt: string
}): Promise<{ base64: string; mimeType: string }> {
  const json = await callGemini(IMAGE_MODEL, [
    { text: params.prompt },
    { inlineData: { mimeType: params.imageMimeType, data: params.imageBase64 } },
  ])

  const parts = json.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((p) => p.inlineData)

  if (!imagePart?.inlineData) {
    throw new HttpError(502, '이미지를 생성하지 못했습니다.')
  }

  return { base64: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType }
}

export async function analyzeProductWithGemini(params: {
  imageBase64: string
  imageMimeType: string
  prompt: string
}): Promise<string> {
  const json = await callGemini(
    VISION_MODEL,
    [{ text: params.prompt }, { inlineData: { mimeType: params.imageMimeType, data: params.imageBase64 } }],
    { responseMimeType: 'application/json' },
  )

  const text = json.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text
  if (!text) {
    throw new HttpError(502, '제품 사진을 분석하지 못했습니다.')
  }
  return text
}
