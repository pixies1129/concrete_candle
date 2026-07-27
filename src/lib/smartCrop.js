let modelPromise = null

function loadModel() {
  if (!modelPromise) {
    modelPromise = Promise.all([
      import('@tensorflow/tfjs'),
      import('@tensorflow-models/coco-ssd'),
    ]).then(async ([tf, cocoSsd]) => {
      await tf.ready()
      return cocoSsd.load({ base: 'lite_mobilenet_v2' })
    })
  }
  return modelPromise
}

async function detectSubjectBox(canvas) {
  try {
    const model = await loadModel()
    const predictions = await model.detect(canvas)
    if (!predictions.length) return null
    predictions.sort((a, b) => b.score - a.score)
    const top = predictions[0]
    if (top.score < 0.35) return null
    const [x, y, w, h] = top.bbox
    return { x, y, w, h, score: top.score, source: 'model', className: top.className }
  } catch (err) {
    return null
  }
}

// Fallback for when the object detector finds nothing (e.g. it doesn't
// recognize "candle"): assumes a fairly plain/uniform background and finds
// the bounding box of pixels that differ most from the corner/background color.
function saliencyBox(canvas) {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')
  const { data } = ctx.getImageData(0, 0, w, h)

  const patch = Math.max(2, Math.round(Math.min(w, h) * 0.04))
  const corners = [
    [0, 0],
    [w - patch, 0],
    [0, h - patch],
    [w - patch, h - patch],
  ]
  let bgR = 0
  let bgG = 0
  let bgB = 0
  let count = 0
  for (const [cx, cy] of corners) {
    for (let y = cy; y < cy + patch; y++) {
      for (let x = cx; x < cx + patch; x++) {
        const i = (y * w + x) * 4
        bgR += data[i]
        bgG += data[i + 1]
        bgB += data[i + 2]
        count++
      }
    }
  }
  bgR /= count
  bgG /= count
  bgB /= count

  const threshold = 42
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  let hits = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const dr = data[i] - bgR
      const dg = data[i + 1] - bgG
      const db = data[i + 2] - bgB
      const dist = Math.sqrt(dr * dr + dg * dg + db * db)
      if (dist > threshold) {
        hits++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const area = w * h
  if (hits < area * 0.01 || hits > area * 0.92) {
    const mx = w * 0.15
    const my = h * 0.15
    return { x: mx, y: my, w: w - mx * 2, h: h - my * 2, source: 'fallback-center' }
  }

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, source: 'saliency' }
}

function computeCropRect(box, natW, natH, targetAspect) {
  const padX = box.w * 0.35
  const padY = box.h * 0.35
  const bx = Math.max(0, box.x - padX)
  const by = Math.max(0, box.y - padY)
  const bw = Math.min(natW - bx, box.w + padX * 2)
  const bh = Math.min(natH - by, box.h + padY * 2)

  const subjCx = bx + bw / 2
  const subjCy = by + bh / 2

  let cropW
  let cropH
  const boxAspect = bw / bh
  if (boxAspect > targetAspect) {
    cropW = bw
    cropH = cropW / targetAspect
  } else {
    cropH = bh
    cropW = cropH * targetAspect
  }

  if (cropW > natW) {
    cropW = natW
    cropH = cropW / targetAspect
  }
  if (cropH > natH) {
    cropH = natH
    cropW = cropH * targetAspect
  }

  let cropX = subjCx - cropW / 2
  let cropY = subjCy - cropH / 2
  cropX = Math.min(Math.max(cropX, 0), natW - cropW)
  cropY = Math.min(Math.max(cropY, 0), natH - cropH)

  return { x: cropX, y: cropY, w: cropW, h: cropH }
}

/**
 * Given a straightened source canvas, detects the main subject (via an
 * in-browser object-detection model, falling back to a background-contrast
 * heuristic) and returns a new canvas re-framed to the target aspect ratio.
 */
export async function smartCrop(sourceCanvas, targetAspect) {
  const natW = sourceCanvas.width
  const natH = sourceCanvas.height

  const box = (await detectSubjectBox(sourceCanvas)) || saliencyBox(sourceCanvas)
  const rect = computeCropRect(box, natW, natH, targetAspect)

  const maxDim = 1600
  let outW = rect.w
  let outH = rect.h
  if (Math.max(outW, outH) > maxDim) {
    const scale = maxDim / Math.max(outW, outH)
    outW = Math.round(outW * scale)
    outH = Math.round(outH * scale)
  }

  const outCanvas = document.createElement('canvas')
  outCanvas.width = Math.round(outW)
  outCanvas.height = Math.round(outH)
  outCanvas
    .getContext('2d')
    .drawImage(sourceCanvas, rect.x, rect.y, rect.w, rect.h, 0, 0, outCanvas.width, outCanvas.height)

  return { canvas: outCanvas, subject: box }
}
