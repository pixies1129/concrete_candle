import { HttpError } from './httpJson.js'
import { markQuotaExhausted, QUOTA_EXCEEDED_MESSAGE } from './quotaGuard.js'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const IMAGE_MODEL = 'gemini-2.5-flash-image'

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

// 429(rate limit)는 재시도 대상에서 제외한다: 실패한 시도도 분당/일일 쿼터에
// 잡힐 수 있어서, 몇 초 백오프로는 어차피 안 풀리는 429를 재시도하면 실패 1건이
// 쿼터 소모 2~3배로 불어난다. 503 등 진짜 일시적 서버 과부하만 재시도 대상으로 둔다.
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504])
const MAX_ATTEMPTS = 2

// "check your plan and billing" 문구가 붙은 429는 플랜 단위 하드 쿼터 초과라
// 몇 초 뒤 재시도해도 100% 다시 실패한다. 감지되면 즉시 포기하고 이후 요청은
// quotaGuard로 막아서 같은 실패에 재시도/요청을 낭비하지 않는다.
function isHardQuotaError(text: string): boolean {
  return /plan and billing/i.test(text)
}

async function callGemini(model: string, parts: GeminiPart[], generationConfig?: Record<string, unknown>) {
  const apiKey = getApiKey()
  const url = `${API_BASE}/${model}:generateContent`
  const init: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      ...(generationConfig ? { generationConfig } : {}),
    }),
  }

  let lastStatus = 0
  let lastText = ''
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, init)
    if (res.ok) {
      return res.json() as Promise<{
        candidates?: { content?: { parts?: GeminiPart[] } }[]
      }>
    }

    lastStatus = res.status
    lastText = await res.text().catch(() => '')

    if (res.status === 429 && isHardQuotaError(lastText)) {
      markQuotaExhausted()
      throw new HttpError(429, QUOTA_EXCEEDED_MESSAGE)
    }
    if (!RETRYABLE_STATUSES.has(res.status)) break
    if (attempt < MAX_ATTEMPTS - 1) {
      const delay = 700 * 2 ** attempt + Math.random() * 400
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new HttpError(lastStatus === 429 ? 429 : 502, `Gemini API 오류 (${lastStatus}): ${lastText.slice(0, 300)}`)
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
