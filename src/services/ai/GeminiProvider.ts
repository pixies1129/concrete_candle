import type { GeneratedImage, GenerationRequest } from '../../types'
import type { AIProvider } from './AIProvider'
import { requestGenerate } from './api'

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini'

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
