const MAX_TILT_DEG = 8
const ANALYSIS_WIDTH = 240

function estimateTiltDegrees(source, natW, natH) {
  const w = ANALYSIS_WIDTH
  const h = Math.max(1, Math.round(natH * (w / natW)))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(source, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  const gray = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
  }

  const bins = new Float64Array(180)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx = gray[i + 1] - gray[i - 1]
      const gy = gray[i + w] - gray[i - w]
      const mag = Math.sqrt(gx * gx + gy * gy)
      if (mag < 15) continue
      const lineAngle = (((Math.atan2(gy, gx) * 180) / Math.PI + 90) % 180 + 180) % 180
      bins[Math.round(lineAngle) % 180] += mag
    }
  }

  let bestOffset = 0
  let bestWeight = -1
  for (let d = -MAX_TILT_DEG; d <= MAX_TILT_DEG; d++) {
    const hAngle = ((d % 180) + 180) % 180
    const vAngle = (((90 + d) % 180) + 180) % 180
    const weight = (bins[hAngle] || 0) + (bins[vAngle] || 0)
    if (weight > bestWeight) {
      bestWeight = weight
      bestOffset = d
    }
  }

  const totalWeight = bins.reduce((a, b) => a + b, 0)
  if (totalWeight < 1 || bestWeight / totalWeight < 0.02) return 0
  return bestOffset
}

// Largest axis-aligned w:h rectangle that fits inside a w x h rect rotated by `angleRad`.
function rotatedRectWithMaxArea(w, h, angleRad) {
  const sinA = Math.abs(Math.sin(angleRad))
  const cosA = Math.abs(Math.cos(angleRad))
  if (sinA < 1e-6) return { w, h }
  const widthIsLonger = w >= h
  const sideLong = widthIsLonger ? w : h
  const sideShort = widthIsLonger ? h : w

  if (sideShort <= 2 * sinA * cosA * sideLong || Math.abs(sinA - cosA) < 1e-10) {
    const x = 0.5 * sideShort
    return widthIsLonger ? { w: x / sinA, h: x / cosA } : { w: x / cosA, h: x / sinA }
  }
  const cos2A = cosA * cosA - sinA * sinA
  return {
    w: (w * cosA - h * sinA) / cos2A,
    h: (h * cosA - w * sinA) / cos2A,
  }
}

/**
 * Detects small tilt (crooked horizon/edges) and rotates+crops to level it.
 * Returns { canvas, angleDeg } where angleDeg is 0 if no correction was needed.
 */
export function autoStraighten(source, natW, natH) {
  const angleDeg = estimateTiltDegrees(source, natW, natH)
  if (angleDeg === 0) {
    const canvas = document.createElement('canvas')
    canvas.width = natW
    canvas.height = natH
    canvas.getContext('2d').drawImage(source, 0, 0, natW, natH)
    return { canvas, angleDeg: 0 }
  }

  const rad = (-angleDeg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const bboxW = natW * cos + natH * sin
  const bboxH = natW * sin + natH * cos

  const rotCanvas = document.createElement('canvas')
  rotCanvas.width = Math.ceil(bboxW)
  rotCanvas.height = Math.ceil(bboxH)
  const rctx = rotCanvas.getContext('2d')
  rctx.translate(bboxW / 2, bboxH / 2)
  rctx.rotate(rad)
  rctx.drawImage(source, -natW / 2, -natH / 2, natW, natH)

  const { w: cw, h: ch } = rotatedRectWithMaxArea(natW, natH, Math.abs(rad))
  const sx = bboxW / 2 - cw / 2
  const sy = bboxH / 2 - ch / 2

  const outCanvas = document.createElement('canvas')
  outCanvas.width = natW
  outCanvas.height = natH
  outCanvas.getContext('2d').drawImage(rotCanvas, sx, sy, cw, ch, 0, 0, natW, natH)

  return { canvas: outCanvas, angleDeg }
}
