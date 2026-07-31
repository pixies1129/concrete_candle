import type { GeneratedImage, GenerationRequest, ProductAnalysis } from '../../types'

export interface AIProvider {
  readonly name: string
  analyzeProduct(image: File): Promise<ProductAnalysis>
  generateImages(request: GenerationRequest, count: number): Promise<GeneratedImage[]>
}

export class AIProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIProviderError'
  }
}
