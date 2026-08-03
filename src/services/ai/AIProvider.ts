import type { GeneratedImage, GenerationRequest } from '../../types'

export interface AIProvider {
  readonly name: string
  generateImages(request: GenerationRequest, count: number): Promise<GeneratedImage[]>
}

export class AIProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIProviderError'
  }
}
