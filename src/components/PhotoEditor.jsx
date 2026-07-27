import { useEffect, useRef, useState } from 'react'
import { autoEnhance } from '../lib/autoEnhance.js'

const FILTERS = {
  none: { label: '원본', css: 'none' },
  warm: { label: '웜톤', css: 'sepia(0.25) saturate(1.3) brightness(1.05)' },
  mono: { label: '흑백', css: 'grayscale(1) contrast(1.1)' },
  vintage: { label: '빈티지', css: 'sepia(0.4) contrast(0.9) brightness(0.95) saturate(0.8)' },
}

const STICKER_CHOICES = ['🔥', '🕯️', '✨', '🏠', '💛', '🎁']

const FONT_FAMILY = "'Pretendard', system-ui, -apple-system, sans-serif"

let nextId = 1
const makeId = () => nextId++

export default function PhotoEditor({ sourceImage, onSourceImageChange }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const originalImgRef = useRef(null)
  const dragRef = useRef(null)

  const [canvasSize, setCanvasSize] = useState(null)
  const [filter, setFilter] = useState('none')
  const [aiEnhanced, setAiEnhanced] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [brandOn, setBrandOn] = useState(false)
  const [brandText, setBrandText] = useState('OO CANDLE')
  const [handleText, setHandleText] = useState('@your_store')
  const [texts, setTexts] = useState([])
  const [stickers, setStickers] = useState([])
  const [selected, setSelected] = useState(null) // { type: 'text'|'sticker', id }

  useEffect(() => {
    if (!sourceImage) {
      imgRef.current = null
      originalImgRef.current = null
      setCanvasSize(null)
      return
    }
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      originalImgRef.current = img
      setAiEnhanced(false)
      const maxDim = 1600
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (Math.max(w, h) > maxDim) {
        const scale = maxDim / Math.max(w, h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }
      setCanvasSize({ w, h })
    }
    img.src = sourceImage
  }, [sourceImage])

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, texts, stickers, filter, brandOn, brandText, handleText, aiEnhanced])

  function toggleAiEnhance() {
    if (!canvasSize || !originalImgRef.current) return
    if (aiEnhanced) {
      imgRef.current = originalImgRef.current
      setAiEnhanced(false)
      return
    }
    setEnhancing(true)
    setTimeout(() => {
      const enhanced = autoEnhance(originalImgRef.current, canvasSize.w, canvasSize.h)
      imgRef.current = enhanced
      setAiEnhanced(true)
      setEnhancing(false)
    }, 10)
  }

  function draw() {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !canvasSize) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.filter = FILTERS[filter].css
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.filter = 'none'

    if (brandOn) {
      const barH = canvas.height * 0.12
      ctx.fillStyle = 'rgba(20,16,14,0.55)'
      ctx.fillRect(0, canvas.height - barH, canvas.width, barH)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f5efe6'
      ctx.font = `700 ${barH * 0.4}px ${FONT_FAMILY}`
      ctx.fillText(brandText, canvas.width * 0.04, canvas.height - barH / 2 - barH * 0.14)
      ctx.font = `400 ${barH * 0.26}px ${FONT_FAMILY}`
      ctx.fillStyle = '#d8cdbe'
      ctx.fillText(handleText, canvas.width * 0.04, canvas.height - barH / 2 + barH * 0.22)
    }

    stickers.forEach((s) => {
      ctx.font = `${s.size}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.emoji, (s.xPct / 100) * canvas.width, (s.yPct / 100) * canvas.height)
    })

    texts.forEach((t) => {
      ctx.font = `700 ${t.size}px ${FONT_FAMILY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const x = (t.xPct / 100) * canvas.width
      const y = (t.yPct / 100) * canvas.height
      ctx.lineWidth = t.size * 0.08
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.strokeText(t.value, x, y)
      ctx.fillStyle = t.color
      ctx.fillText(t.value, x, y)
    })
  }

  function getCanvasPoint(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function hitTest(point) {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i]
      const cx = (s.xPct / 100) * canvas.width
      const cy = (s.yPct / 100) * canvas.height
      const half = s.size / 2
      if (Math.abs(point.x - cx) < half && Math.abs(point.y - cy) < half) {
        return { type: 'sticker', id: s.id }
      }
    }

    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i]
      ctx.font = `700 ${t.size}px ${FONT_FAMILY}`
      const width = ctx.measureText(t.value).width
      const cx = (t.xPct / 100) * canvas.width
      const cy = (t.yPct / 100) * canvas.height
      if (
        Math.abs(point.x - cx) < width / 2 + 10 &&
        Math.abs(point.y - cy) < t.size / 2 + 10
      ) {
        return { type: 'text', id: t.id }
      }
    }

    return null
  }

  function handlePointerDown(e) {
    const point = getCanvasPoint(e)
    const hit = hitTest(point)
    setSelected(hit)
    if (hit) {
      e.target.setPointerCapture(e.pointerId)
      dragRef.current = { ...hit, pointerId: e.pointerId }
    }
  }

  function handlePointerMove(e) {
    if (!dragRef.current) return
    const point = getCanvasPoint(e)
    const canvas = canvasRef.current
    const xPct = Math.min(100, Math.max(0, (point.x / canvas.width) * 100))
    const yPct = Math.min(100, Math.max(0, (point.y / canvas.height) * 100))
    const { type, id } = dragRef.current
    if (type === 'text') {
      setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, xPct, yPct } : t)))
    } else {
      setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, xPct, yPct } : s)))
    }
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  function addText() {
    const id = makeId()
    setTexts((prev) => [
      ...prev,
      { id, value: '텍스트 입력', xPct: 50, yPct: 50, size: 48, color: '#ffffff' },
    ])
    setSelected({ type: 'text', id })
  }

  function addSticker(emoji) {
    const id = makeId()
    setStickers((prev) => [...prev, { id, emoji, xPct: 50, yPct: 50, size: 64 }])
    setSelected({ type: 'sticker', id })
  }

  function updateSelectedText(patch) {
    if (!selected || selected.type !== 'text') return
    setTexts((prev) => prev.map((t) => (t.id === selected.id ? { ...t, ...patch } : t)))
  }

  function updateSelectedSticker(patch) {
    if (!selected || selected.type !== 'sticker') return
    setStickers((prev) => prev.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)))
  }

  function deleteSelected() {
    if (!selected) return
    if (selected.type === 'text') {
      setTexts((prev) => prev.filter((t) => t.id !== selected.id))
    } else {
      setStickers((prev) => prev.filter((s) => s.id !== selected.id))
    }
    setSelected(null)
  }

  function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onSourceImageChange(reader.result)
    reader.readAsDataURL(file)
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `concrete-candle-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const selectedText = selected?.type === 'text' ? texts.find((t) => t.id === selected.id) : null
  const selectedSticker =
    selected?.type === 'sticker' ? stickers.find((s) => s.id === selected.id) : null

  if (!sourceImage) {
    return (
      <section className="photo-editor empty">
        <p>편집할 사진이 없어요. 촬영 가이드에서 찍거나 사진을 업로드해주세요.</p>
        <label className="btn primary">
          사진 업로드
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
        </label>
      </section>
    )
  }

  return (
    <section className="photo-editor">
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width={canvasSize?.w || 1}
          height={canvasSize?.h || 1}
          className="edit-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>

      <div className="editor-panel">
        <div className="panel-row edit-block ai-block">
          <span className="panel-label">AI 감성보정</span>
          <p className="ai-hint">
            화이트밸런스·명암·채도를 자동으로 분석해서 정돈된 톤으로 바꿔줘요.
          </p>
          <button
            className={aiEnhanced ? 'btn primary' : 'btn secondary'}
            onClick={toggleAiEnhance}
            disabled={enhancing}
          >
            {enhancing ? '보정 중...' : aiEnhanced ? '✨ 원본으로 되돌리기' : '✨ AI로 감성보정'}
          </button>
        </div>

        <div className="panel-row">
          <span className="panel-label">필터</span>
          <div className="chip-row">
            {Object.entries(FILTERS).map(([key, f]) => (
              <button
                key={key}
                className={filter === key ? 'chip active' : 'chip'}
                onClick={() => setFilter(key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-row">
          <span className="panel-label">텍스트 / 스티커</span>
          <div className="chip-row">
            <button className="chip" onClick={addText}>
              + 텍스트 추가
            </button>
            {STICKER_CHOICES.map((emoji) => (
              <button key={emoji} className="chip emoji" onClick={() => addSticker(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {selectedText && (
          <div className="panel-row edit-block">
            <span className="panel-label">선택한 텍스트</span>
            <input
              type="text"
              value={selectedText.value}
              onChange={(e) => updateSelectedText({ value: e.target.value })}
            />
            <div className="inline-controls">
              <input
                type="color"
                value={selectedText.color}
                onChange={(e) => updateSelectedText({ color: e.target.value })}
              />
              <input
                type="range"
                min="20"
                max="120"
                value={selectedText.size}
                onChange={(e) => updateSelectedText({ size: Number(e.target.value) })}
              />
              <button className="btn danger small" onClick={deleteSelected}>
                삭제
              </button>
            </div>
          </div>
        )}

        {selectedSticker && (
          <div className="panel-row edit-block">
            <span className="panel-label">선택한 스티커</span>
            <div className="inline-controls">
              <input
                type="range"
                min="24"
                max="160"
                value={selectedSticker.size}
                onChange={(e) => updateSelectedSticker({ size: Number(e.target.value) })}
              />
              <button className="btn danger small" onClick={deleteSelected}>
                삭제
              </button>
            </div>
          </div>
        )}

        <div className="panel-row edit-block">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={brandOn}
              onChange={(e) => setBrandOn(e.target.checked)}
            />
            브랜드 프레임 넣기
          </label>
          {brandOn && (
            <div className="inline-controls stacked">
              <input
                type="text"
                value={brandText}
                onChange={(e) => setBrandText(e.target.value)}
                placeholder="브랜드명"
              />
              <input
                type="text"
                value={handleText}
                onChange={(e) => setHandleText(e.target.value)}
                placeholder="@인스타그램"
              />
            </div>
          )}
        </div>

        <div className="panel-row actions">
          <label className="btn secondary">
            다른 사진으로 교체
            <input type="file" accept="image/*" onChange={handleUpload} hidden />
          </label>
          <button className="btn primary" onClick={handleDownload}>
            이미지 다운로드
          </button>
        </div>
      </div>
    </section>
  )
}
