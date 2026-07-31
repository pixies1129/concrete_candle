import { useCallback, useState } from 'react'
import type { UploadedProduct } from '../types'
import { loadImageElement } from '../utils/image'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MIN_DIMENSION = 400

export function useImageUpload() {
  const [product, setProduct] = useState<UploadedProduct | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadFile = useCallback(async (file: File) => {
    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('JPG, PNG, WEBP 파일만 업로드할 수 있어요.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    try {
      const img = await loadImageElement(previewUrl)
      if (img.naturalWidth < MIN_DIMENSION || img.naturalHeight < MIN_DIMENSION) {
        setError('더 선명한 제품 사진을 사용해주세요.')
        URL.revokeObjectURL(previewUrl)
        return
      }
      setProduct({ file, previewUrl, width: img.naturalWidth, height: img.naturalHeight })
    } catch {
      setError('이미지를 불러오지 못했어요. 다른 사진을 시도해주세요.')
      URL.revokeObjectURL(previewUrl)
    }
  }, [])

  const reset = useCallback(() => {
    if (product) URL.revokeObjectURL(product.previewUrl)
    setProduct(null)
    setError(null)
  }, [product])

  return { product, error, loadFile, reset }
}
