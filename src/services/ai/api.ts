import type { GenerationRequest, ProductAnalysis } from '../../types'
import { fileToBase64 } from '../../utils/image'
import { AIProviderError } from './AIProvider'

interface RawGenerateResponse {
  images: { id: string; url: string }[]
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AIProviderError('네트워크에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', 'api-error')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}) as { error?: string })
    if (data.error) console.error('[CANDLE STUDIO AI]', path, res.status, data.error)
    // 400/413은 사용자가 바로 고칠 수 있는 요청 문제라 서버 메시지를 그대로 보여준다.
    if ((res.status === 400 || res.status === 413) && data.error) {
      throw new AIProviderError(data.error, 'api-error')
    }
    const code = res.status >= 500 ? 'generation-failed' : 'api-error'
    const friendly = res.status >= 500 ? '이미지를 생성하지 못했습니다.' : '잠시 후 다시 시도해주세요.'
    throw new AIProviderError(friendly, code)
  }

  return res.json() as Promise<T>
}

export async function requestAnalyze(file: File): Promise<ProductAnalysis> {
  const { base64, mimeType } = await fileToBase64(file)
  return postJson<ProductAnalysis>('/api/analyze', { imageBase64: base64, imageMimeType: mimeType })
}

export async function requestGenerate(request: GenerationRequest, count: number): Promise<RawGenerateResponse> {
  const { base64, mimeType } = await fileToBase64(request.image.file)
  return postJson<RawGenerateResponse>('/api/generate', {
    imageBase64: base64,
    imageMimeType: mimeType,
    target: request.target,
    aspectRatio: request.aspectRatio,
    concept: request.concept,
    season: request.season,
    props: request.props,
    count,
  })
}
