import { HttpError } from './httpJson.js'
import { generateImageWithGemini } from './gemini.js'
import { buildGenerationPrompt } from './promptBuilder.js'
import { isQuotaExhausted, QUOTA_EXCEEDED_MESSAGE } from './quotaGuard.js'

interface GenerateRequestBody {
  imageBase64?: string
  imageMimeType?: string
  target?: string
  aspectRatio?: string
  concept?: string
  season?: string
  props?: string[]
  count?: number
}

export interface GenerateResponse {
  images: { id: string; url: string }[]
}

const MAX_COUNT = 4

export async function handleGenerate(body: GenerateRequestBody): Promise<GenerateResponse> {
  if (isQuotaExhausted()) {
    throw new HttpError(429, QUOTA_EXCEEDED_MESSAGE)
  }
  if (!body?.imageBase64 || !body?.imageMimeType) {
    throw new HttpError(400, '제품 사진이 필요합니다.')
  }
  if (!body.target || !body.aspectRatio || !body.concept) {
    throw new HttpError(400, '스타일 정보가 올바르지 않습니다.')
  }

  const count = Math.min(Math.max(body.count ?? 1, 1), MAX_COUNT)
  const prompt = buildGenerationPrompt({
    target: body.target,
    aspectRatio: body.aspectRatio,
    concept: body.concept,
    season: body.season,
    props: body.props ?? [],
  })

  const settled = await Promise.allSettled(
    Array.from({ length: count }, () =>
      generateImageWithGemini({
        imageBase64: body.imageBase64!,
        imageMimeType: body.imageMimeType!,
        prompt,
      }),
    ),
  )

  const images = settled
    .filter((r): r is PromiseFulfilledResult<{ base64: string; mimeType: string }> => r.status === 'fulfilled')
    .map((r, i) => ({
      id: `gemini-${Date.now()}-${i}`,
      url: `data:${r.value.mimeType};base64,${r.value.base64}`,
    }))

  if (images.length === 0) {
    const firstError = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')?.reason
    if (firstError instanceof HttpError) throw firstError
    const message = firstError instanceof Error ? firstError.message : '이미지를 생성하지 못했습니다.'
    throw new HttpError(502, message)
  }

  return { images }
}
