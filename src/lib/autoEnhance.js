function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}

/**
 * Analyzes and enhances image pixel data in place: gray-world white balance,
 * percentile levels stretch, saturation lift, warm/cool split-tone, vignette.
 */
function enhanceImageData(imageData, width, height) {
  const data = imageData.data
  const pixelCount = width * height

  let sumR = 0
  let sumG = 0
  let sumB = 0
  const hist = new Uint32Array(256)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    sumR += r
    sumG += g
    sumB += b
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    hist[luma]++
  }

  const avgR = sumR / pixelCount || 1
  const avgG = sumG / pixelCount || 1
  const avgB = sumB / pixelCount || 1
  const avgGray = (avgR + avgG + avgB) / 3

  const gainR = clamp(avgGray / avgR, 0.85, 1.25)
  const gainG = clamp(avgGray / avgG, 0.85, 1.25)
  const gainB = clamp(avgGray / avgB, 0.85, 1.25)

  const loTarget = pixelCount * 0.01
  const hiTarget = pixelCount * 0.01
  let cum = 0
  let lo = 0
  for (let v = 0; v < 256; v++) {
    cum += hist[v]
    if (cum >= loTarget) {
      lo = v
      break
    }
  }
  cum = 0
  let hi = 255
  for (let v = 255; v >= 0; v--) {
    cum += hist[v]
    if (cum >= hiTarget) {
      hi = v
      break
    }
  }
  if (hi <= lo) {
    lo = 0
    hi = 255
  }
  const range = hi - lo || 1

  const saturation = 1.18
  const vignetteStrength = 0.22
  const cx = width / 2
  const cy = height / 2
  const maxDist = Math.sqrt(cx * cx + cy * cy)

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] * gainR
    let g = data[i + 1] * gainG
    let b = data[i + 2] * gainB

    r = ((r - lo) / range) * 255
    g = ((g - lo) / range) * 255
    b = ((b - lo) / range) * 255

    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    r = luma + (r - luma) * saturation
    g = luma + (g - luma) * saturation
    b = luma + (b - luma) * saturation

    const t = clamp(luma / 255, 0, 1)
    const warm = (t - 0.5) * 16
    r += warm
    b -= warm * 0.6

    const pixelIndex = i / 4
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist
    const vignette = 1 - vignetteStrength * dist * dist

    data[i] = clampByte(r * vignette)
    data[i + 1] = clampByte(g * vignette)
    data[i + 2] = clampByte(b * vignette)
  }

  return imageData
}

/**
 * Runs auto-enhance on a drawable image source and returns a new canvas
 * containing the result, leaving the original source untouched.
 */
export function autoEnhance(source, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(source, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)
  enhanceImageData(imageData, width, height)
  ctx.putImageData(imageData, 0, 0)
  return canvas
}
