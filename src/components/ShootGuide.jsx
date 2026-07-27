import { useEffect, useRef, useState } from 'react'

const GUIDES = [
  {
    id: 'certshot',
    label: '정면 인증샷',
    tip: '캔들을 중앙에 두고 3분할선에 맞춰 정면에서 촬영하세요.',
    overlay: 'thirds',
  },
  {
    id: 'flame',
    label: '불빛 연출',
    tip: '불을 붙이고 어두운 배경에서 옆/위 45도 각도로 가까이 촬영하세요.',
    overlay: 'center-circle',
  },
  {
    id: 'space',
    label: '공간 배치',
    tip: '캔들을 공간 한쪽에 배치하고 넓게 촬영해 인테리어 무드를 담으세요.',
    overlay: 'corner-box',
  },
]

export default function ShootGuide({ onCaptured }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [guideId, setGuideId] = useState(GUIDES[0].id)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  const guide = GUIDES.find((g) => g.id === guideId)

  useEffect(() => {
    let stream
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setReady(true)
        }
      } catch (err) {
        setError('카메라에 접근할 수 없어요. 권한을 확인하거나 사진을 직접 업로드해주세요.')
      }
    }
    startCamera()
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    onCaptured(canvas.toDataURL('image/png'))
  }

  function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onCaptured(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <section className="shoot-guide">
      <div className="guide-picker">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            className={g.id === guideId ? 'guide-chip active' : 'guide-chip'}
            onClick={() => setGuideId(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="guide-tip">{guide.tip}</p>

      <div className="camera-frame">
        {error ? (
          <div className="camera-error">{error}</div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
        )}
        <div className={`overlay overlay-${guide.overlay}`} />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="shoot-actions">
        <button className="btn primary" onClick={capture} disabled={!ready}>
          촬영하기
        </button>
        <label className="btn secondary">
          사진 업로드
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
        </label>
      </div>
    </section>
  )
}
