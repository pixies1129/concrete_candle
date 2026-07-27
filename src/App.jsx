import { useState } from 'react'
import ShootGuide from './components/ShootGuide.jsx'
import PhotoEditor from './components/PhotoEditor.jsx'

export default function App() {
  const [view, setView] = useState('shoot')
  const [sourceImage, setSourceImage] = useState(null)

  function handleCaptured(dataUrl) {
    setSourceImage(dataUrl)
    setView('edit')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>콘크리트 캔들 콘텐츠 스튜디오</h1>
        <nav className="tabs">
          <button
            className={view === 'shoot' ? 'tab active' : 'tab'}
            onClick={() => setView('shoot')}
          >
            촬영 가이드
          </button>
          <button
            className={view === 'edit' ? 'tab active' : 'tab'}
            onClick={() => setView('edit')}
          >
            편집
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'shoot' && <ShootGuide onCaptured={handleCaptured} />}
        {view === 'edit' && (
          <PhotoEditor sourceImage={sourceImage} onSourceImageChange={setSourceImage} />
        )}
      </main>
    </div>
  )
}
