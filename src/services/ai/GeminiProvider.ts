import type { GeneratedImage, GenerationRequest, ProductAnalysis } from '../../types'
import type { AIProvider } from './AIProvider'
import { requestAnalyze, requestGenerate } from './api'

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini'

  async analyzeProduct(image: File): Promise<ProductAnalysis> {
    return requestAnalyze(image)
  }

  async generateImages(request: GenerationRequest, count: number): Promise<GeneratedImage[]> {
    const { images } = await requestGenerate(request, count)
    return images.map((img) => ({
      id: img.id,
      url: img.url,
      aspectRatio: request.aspectRatio,
      concept: request.concept,
    }))
  }
}
