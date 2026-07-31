export interface Base64Image {
  base64: string
  mimeType: string
}

const MAX_DIMENSION = 1536
const JPEG_QUALITY = 0.85

// 모바일 카메라 원본은 수 MB에 달해 서버리스 함수의 요청 본문 제한(약 4.5MB)을
// 넘기기 쉽다. AI에 보내기 전 항상 리사이즈 + JPEG 재압축을 거친다.
export function fileToBase64(file: File): Promise<Base64Image> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
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
      URL.revokeObjectURL(objectUrl)

      if (!ctx) {
        reject(new Error('이미지를 처리하지 못했습니다.'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      resolve({ base64: dataUrl.split(',')[1] ?? '', mimeType: 'image/jpeg' })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 읽지 못했습니다. 다른 사진을 시도해주세요.'))
    }

    img.src = objectUrl
  })
}
