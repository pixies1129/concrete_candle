import type { GeneratedImage } from '../types'

interface ResultGalleryProps {
  image: GeneratedImage | null
  loading: boolean
  onToggleLike: () => void
  onDownload: (image: GeneratedImage) => void
  onRegenerate: () => void
  onRestyle: () => void
}

function aspectClass(aspectRatio: GeneratedImage['aspectRatio']) {
  if (aspectRatio === '4:5') return 'ar-4-5'
  if (aspectRatio === '9:16') return 'ar-9-16'
  return ''
}

export function ResultGallery({ image, loading, onToggleLike, onDownload, onRegenerate, onRestyle }: ResultGalleryProps) {
  return (
    <div>
      {loading && <div className="result-skeleton" />}

      {!loading && image && (
        <div className="result-card">
          <div className={`result-image-wrap ${aspectClass(image.aspectRatio)}`}>
            <img src={image.url} alt="생성된 제품 이미지" />
            <button type="button" className="result-like" onClick={onToggleLike} aria-label="마음에 들어요">
              {image.liked ? '♥' : '♡'}
            </button>
          </div>
          <div className="result-actions">
            <button type="button" className="btn btn-secondary" onClick={() => onDownload(image)}>
              다운로드
            </button>
          </div>
        </div>
      )}

      {!loading && image && (
        <div className="uploader-actions" style={{ marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={onRegenerate}>
            다시 만들기
          </button>
          <button type="button" className="btn btn-secondary" onClick={onRestyle}>
            다른 분위기로 만들기
          </button>
        </div>
      )}
    </div>
  )
}
