import type { GeneratedImage, GenerationRequest, ProductAnalysis } from '../../types'
import type { AIProvider } from './AIProvider'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// VITE_USE_MOCK_AI=true일 때 사용하는, 실제 AI 호출 없이 업로드 이미지를 그대로 돌려주는 구현.
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
