export function estimateBackgroundColor(canvas) {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')
  const patch = Math.max(2, Math.round(Math.min(w, h) * 0.04))
  const corners = [
    [0, 0],
    [w - patch, 0],
    [0, h - patch],
    [w - patch, h - patch],
  ]

  let r = 0
  let g = 0
  let b = 0
  let count = 0
  for (const [cx, cy] of corners) {
    const { data } = ctx.getImageData(cx, cy, patch, patch)
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count++
    }
  }

  return { r: r / count, g: g / count, b: b / count }
}

export function colorDistance(r, g, b, bg) {
  const dr = r - bg.r
  const dg = g - bg.g
  const db = b - bg.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}
