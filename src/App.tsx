import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Create } from './pages/Create'
import { Gallery } from './pages/Gallery'
import { Brand } from './pages/Brand'

export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="top-bar">
          <span className="brand-mark">CANDLE STUDIO AI</span>
          <span className="brand-tagline">사진 한 장으로 만드는 캔들 브랜드 콘텐츠</span>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/brand" element={<Brand />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
