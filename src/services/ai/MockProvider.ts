import type { GeneratedImage, GenerationRequest, ProductAnalysis } from '../../types'
import type { AIProvider } from './AIProvider'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * STEP 2에서 GeminiProvider로 교체되기 전까지 위저드 UI를 검증하기 위한 임시 구현.
 * 업로드된 원본 이미지를 그대로 결과로 반환한다 (실제 AI 생성 없음).
 */
export class MockProvider implements AIProvider {
  readonly name = 'mock'

  async analyzeProduct(): Promise<ProductAnalysis> {
    await wait(300)
    return {
      productType: 'candle',
      containerShape: 'unknown',
      dominantColors: [],
      hasLabel: false,
      hasLogo: false,
      notableFeatures: [],
    }
  }

  async generateImages(request: GenerationRequest, count: number): Promise<GeneratedImage[]> {
    await wait(1200)
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-${Date.now()}-${i}`,
      url: request.image.previewUrl,
      aspectRatio: request.aspectRatio,
      concept: request.concept,
    }))
  }
}
