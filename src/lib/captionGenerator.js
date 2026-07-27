function analyzeMood(canvas) {
  const w = 120
  const h = Math.max(1, Math.round(canvas.height * (w / canvas.width)))
  const small = document.createElement('canvas')
  small.width = w
  small.height = h
  const ctx = small.getContext('2d')
  ctx.drawImage(canvas, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  let sumR = 0
  let sumG = 0
  let sumB = 0
  const n = w * h
  for (let i = 0; i < data.length; i += 4) {
    sumR += data[i]
    sumG += data[i + 1]
    sumB += data[i + 2]
  }
  const r = sumR / n
  const g = sumG / n
  const b = sumB / n

  const brightness = (r + g + b) / 3 / 255
  const warmth = (r - b) / 255
  const maxC = Math.max(r, g, b)
  const minC = Math.min(r, g, b)
  const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC

  let mood
  if (warmth > 0.06 && brightness < 0.55) mood = '포근한'
  else if (brightness > 0.72 && saturation < 0.25) mood = '미니멀한'
  else if (saturation > 0.35 && warmth > 0) mood = '로맨틱한'
  else if (brightness < 0.35) mood = '차분한'
  else mood = '내추럴한'

  return { brightness, warmth, saturation, mood }
}

const CAPTION_TEMPLATES = [
  ({ mood, brand }) => `${mood} 하루엔 ${brand}. 작은 불빛 하나로 공간의 온도가 달라져요.`,
  ({ mood, brand }) => `${brand}와 함께하는 ${mood} 저녁 시간 🕯️`,
  ({ mood, brand }) => `오늘도 ${mood} 무드로, ${brand}`,
  ({ mood, brand }) => `${mood} 공간엔 ${mood} 향이 어울리죠. ${brand}로 완성했어요.`,
  ({ mood, brand }) => `불을 붙이는 순간, ${mood} 분위기가 시작돼요 — ${brand}`,
]

/**
 * Picks one random caption template (analyzing the photo's mood) so every
 * click produces a fresh line. Avoids immediately repeating the same
 * template twice in a row.
 */
let lastTemplateIndex = -1

export function generateCaption(canvas, brandName) {
  const brand = brandName?.trim() || '이 캔들'
  const { mood } = analyzeMood(canvas)

  let index = Math.floor(Math.random() * CAPTION_TEMPLATES.length)
  if (CAPTION_TEMPLATES.length > 1 && index === lastTemplateIndex) {
    index = (index + 1) % CAPTION_TEMPLATES.length
  }
  lastTemplateIndex = index

  return CAPTION_TEMPLATES[index]({ mood, brand })
}
