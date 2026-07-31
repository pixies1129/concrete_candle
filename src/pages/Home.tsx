import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="hero">
      <h1 className="hero-title">
        캔들 사진 한 장으로,
        <br />
        브랜드 화보를 만들어보세요.
      </h1>
      <p className="hero-sub">
        스마트폰으로 찍은 제품 사진 한 장이면
        <br />
        스마트스토어와 인스타그램용 이미지가 완성됩니다.
      </p>

      <Link to="/create" className="btn btn-primary">
        ＋ 제품 사진 업로드
      </Link>

      <div className="hero-flow">
        <span className="flow-chip">1. 사진 업로드</span>
        <span className="flow-chip">2. 스타일 선택</span>
        <span className="flow-chip">3. AI 이미지 생성</span>
      </div>
    </div>
  )
}
