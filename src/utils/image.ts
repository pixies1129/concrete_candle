export interface Base64Image {
  base64: string
  mimeType: string
}

const MAX_DIMENSION = 1536
const JPEG_QUALITY = 0.85

export function loadImageElement(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'))
    img.src = objectUrl
  })
}

async function resizeToBase64(file: File): Promise<Base64Image> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImageElement(objectUrl)
    let { naturalWidth: width, naturalHeight: height } = img
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('이미지를 처리하지 못했습니다.')

    ctx.drawImage(img, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
    return { base64: dataUrl.split(',')[1] ?? '', mimeType: 'image/jpeg' }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const cache = new WeakMap<File, Promise<Base64Image>>()

// 모바일 카메라 원본은 수 MB에 달해 서버리스 함수의 요청 본문 제한을 넘기기
// 쉽다. AI에 보내기 전 항상 리사이즈 + JPEG 재압축을 거치고, 같은 파일로
// 분석/생성/재생성을 반복 호출해도 디코드·리샘플·인코드를 한 번만 하도록 캐싱한다.
export function fileToBase64(file: File): Promise<Base64Image> {
  const cached = cache.get(file)
  if (cached) return cached

  const promise = resizeToBase64(file).catch((err) => {
    cache.delete(file)
    throw err
  })
  cache.set(file, promise)
  return promise
}
