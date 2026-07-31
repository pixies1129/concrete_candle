import type { GeneratedImage, GenerationRequest, ProductAnalysis } from '../../types'

export interface AIProvider {
  readonly name: string
  analyzeProduct(image: File): Promise<ProductAnalysis>
  generateImages(request: GenerationRequest, count: number): Promise<GeneratedImage[]>
}

export class AIProviderError extends Error {
  code: 'api-error' | 'generation-failed'

  constructor(message: string, code: 'api-error' | 'generation-failed' = 'api-error') {
    super(message)
    this.name = 'AIProviderError'
    this.code = code
  }
}
