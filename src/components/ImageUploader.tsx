import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import type { UploadedProduct } from '../types'

interface ImageUploaderProps {
  product: UploadedProduct | null
  error: string | null
  onFile: (file: File) => void
  onReset: () => void
}

export function ImageUploader({ product, error, onFile, onReset }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  if (product) {
    return (
      <div className="uploader-preview">
        <img src={product.previewUrl} alt="업로드한 제품 사진" />
        <div className="uploader-preview-footer">
          <span className="uploader-sub">
            {product.width}×{product.height}px
          </span>
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            다시 선택
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`uploader${dragOver ? ' dragover' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <div className="uploader-icon">＋</div>
        <p className="uploader-title">제품 사진 업로드</p>
        <p className="uploader-sub">클릭하거나 사진을 끌어다 놓으세요 (JPG · PNG · WEBP)</p>
      </div>

      <div className="uploader-actions">
        <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          사진 선택
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => cameraInputRef.current?.click()}>
          카메라로 촬영
        </button>
      </div>

      {error && <p className="uploader-sub" style={{ color: '#b3261e', marginTop: 12 }}>{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
