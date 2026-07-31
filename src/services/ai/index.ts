import type { AIProvider } from './AIProvider'
import { GeminiProvider } from './GeminiProvider'
import { MockProvider } from './MockProvider'

let provider: AIProvider | null = null

// VITE_USE_MOCK_AI=true 로 실행하면 Gemini 호출 없이(비용 없이) UI 플로우만 검증할 수 있다.
export function getAIProvider(): AIProvider {
  if (!provider) {
    provider = import.meta.env.VITE_USE_MOCK_AI === 'true' ? new MockProvider() : new GeminiProvider()
  }
  return provider
}

export type { AIProvider } from './AIProvider'
export { AIProviderError } from './AIProvider'
