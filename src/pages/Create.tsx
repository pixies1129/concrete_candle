import { useCallback, useState } from 'react'
import { useImageUpload } from '../hooks/useImageUpload'
import { ImageUploader } from '../components/ImageUploader'
import { OutputTargetSelector } from '../components/OutputTargetSelector'
import { ConceptSelector } from '../components/ConceptSelector'
import { PropSelector } from '../components/PropSelector'
import { ResultGallery } from '../components/ResultGallery'
import { getAIProvider } from '../services/ai'
import { CONCEPTS } from '../data/catalog'
import type { AspectRatio, ConceptId, GeneratedImage, GenerationRequest, OutputTargetId, PropId, SeasonId } from '../types'

const STEP_LABELS = ['사진 업로드', '스타일 선택', '생성 결과']
const RESULT_COUNT = 4

export function Create() {
  const { product, error: uploadError, loadFile, reset } = useImageUpload()

  const [step, setStep] = useState(1)
  const [target, setTarget] = useState<OutputTargetId>('smartstore-main')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1')
  const [concept, setConcept] = useState<ConceptId>('minimal')
  const [season, setSeason] = useState<SeasonId>('christmas')
  const [props, setProps] = useState<PropId[]>([])

  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const [analyzing, setAnalyzing] = useState(false)
  const [detectionWarning, setDetectionWarning] = useState<string | null>(null)

  const goToStyleStep = useCallback(async () => {
    if (!product) return
    setDetectionWarning(null)
    setAnalyzing(true)
    try {
      const analysis = await getAIProvider().analyzeProduct(product.file)
      const noProductDetected =
        !analysis.productType || ['none', 'unknown', '없음'].includes(analysis.productType.trim().toLowerCase())
      if (noProductDetected) {
        setDetectionWarning('제품이 잘 보이는 사진을 업로드해주세요.')
      }
    } catch {
      // 분석 실패는 진행을 막지 않는다 — 참고용 신호일 뿐이다.
    } finally {
      setAnalyzing(false)
      setStep(2)
    }
  }, [product])

  const generate = useCallback(
    async (overrideConcept?: ConceptId) => {
      if (!product) return
      setStep(3)
      setLoading(true)
      setGenError(null)
      try {
        const request: GenerationRequest = {
          image: product,
          target,
          aspectRatio,
          concept: overrideConcept ?? concept,
          season: concept === 'seasonal' ? season : undefined,
          props,
        }
        const results = await getAIProvider().generateImages(request, RESULT_COUNT)
        setImages(results)
      } catch (e) {
        setGenError(e instanceof Error ? e.message : '이미지를 생성하지 못했습니다.')
        setImages([])
      } finally {
        setLoading(false)
      }
    },
    [product, target, aspectRatio, concept, season, props],
  )

  const handleRestyle = useCallback(() => {
    const others = CONCEPTS.filter((c) => c.id !== concept)
    const next = others[Math.floor(Math.random() * others.length)]
    setConcept(next.id)
    void generate(next.id)
  }, [concept, generate])

  const toggleLike = (id: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, liked: !img.liked } : img)))
  }

  const download = (image: GeneratedImage) => {
    const a = document.createElement('a')
    a.href = image.url
    a.download = `candle-studio-${image.concept}-${Date.now()}.png`
    a.click()
  }

  return (
    <div>
      <div className="step-indicator">
        {STEP_LABELS.map((_, i) => (
          <div key={i} className={`step-dot${i + 1 <= step ? ' active' : ''}`} />
        ))}
      </div>
      <p className="step-label">
        STEP {step} · {STEP_LABELS[step - 1]}
      </p>

      {step === 1 && (
        <div>
          <ImageUploader product={product} error={uploadError} onFile={loadFile} onReset={reset} />
          <div className="generate-bar">
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!product || analyzing}
              onClick={() => void goToStyleStep()}
            >
              {analyzing ? '사진 확인 중...' : '다음 단계'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {detectionWarning && (
            <div className="error-banner">
              <span>{detectionWarning}</span>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                다시 업로드
              </button>
            </div>
          )}

          <p className="section-title">어떤 이미지를 만들까요?</p>
          <OutputTargetSelector
            target={target}
            aspectRatio={aspectRatio}
            onChange={(t, ar) => {
              setTarget(t)
              setAspectRatio(ar)
            }}
          />

          <p className="section-title">촬영 콘셉트</p>
          <ConceptSelector concept={concept} season={season} onChangeConcept={setConcept} onChangeSeason={setSeason} />

          <p className="section-title">소품 (선택)</p>
          <PropSelector selected={props} onChange={setProps} />

          <div className="generate-bar">
            <button type="button" className="btn btn-primary btn-block" onClick={() => void generate()}>
              이미지 만들기
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {genError && (
            <div className="error-banner">
              <span>{genError}</span>
              <button type="button" className="btn btn-secondary" onClick={() => void generate()}>
                다시 시도
              </button>
            </div>
          )}

          <ResultGallery
            images={images}
            loading={loading}
            pendingCount={RESULT_COUNT}
            onToggleLike={toggleLike}
            onDownload={download}
            onRegenerate={() => void generate()}
            onRestyle={handleRestyle}
          />

          {!loading && (
            <button type="button" className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setStep(2)}>
              ← 스타일 다시 선택
            </button>
          )}
        </div>
      )}
    </div>
  )
}
