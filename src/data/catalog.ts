import type { Concept, OutputTarget, Prop, Season } from '../types'

export const OUTPUT_TARGETS: OutputTarget[] = [
  {
    id: 'smartstore-main',
    label: '스마트스토어 대표사진',
    description: '깔끔한 화이트 배경의 상품 목록용 대표 이미지',
    aspectRatios: ['1:1'],
  },
  {
    id: 'detail-page',
    label: '상세페이지 사진',
    description: '제품 단독·감성 연출·사용 장면이 담긴 상세페이지용 이미지',
    aspectRatios: ['1:1', '4:5'],
  },
  {
    id: 'instagram-feed',
    label: '인스타그램 사진',
    description: '피드에 올릴 정사각형 또는 세로형 이미지',
    aspectRatios: ['1:1', '4:5'],
  },
  {
    id: 'instagram-story',
    label: '인스타그램 스토리',
    description: '9:16 세로 전체화면 스토리 이미지',
    aspectRatios: ['9:16'],
  },
  {
    id: 'brand-editorial',
    label: '브랜드 화보',
    description: '브랜드 무드를 담은 화보 스타일 이미지',
    aspectRatios: ['4:5', '1:1'],
  },
]

export const CONCEPTS: Concept[] = [
  { id: 'minimal', code: '01', label: 'MINIMAL', description: '화이트 · 베이지 · 심플 · 깨끗한 제품 사진' },
  { id: 'luxury', code: '02', label: 'LUXURY', description: '고급 호텔 · 대리석 · 은은한 조명 · 프리미엄' },
  { id: 'natural', code: '03', label: 'NATURAL', description: '우드 · 식물 · 자연광 · 따뜻한 분위기' },
  { id: 'cozy', code: '04', label: 'COZY', description: '침실 · 책 · 패브릭 · 따뜻한 조명' },
  { id: 'concrete', code: '05', label: 'CONCRETE', description: '콘크리트 · 시멘트 · 건축적인 분위기' },
  { id: 'dark-mood', code: '06', label: 'DARK MOOD', description: '어두운 배경 · 강한 명암 · 고급스러운 분위기' },
  { id: 'korean-minimal', code: '07', label: 'KOREAN MINIMAL', description: '한국적인 미니멀 인테리어 · 여백 · 자연 소재' },
  { id: 'seasonal', code: '08', label: 'SEASONAL', description: '계절과 기념일에 맞춘 연출' },
]

export const SEASONS: Season[] = [
  { id: 'spring', label: '봄' },
  { id: 'summer', label: '여름' },
  { id: 'autumn', label: '가을' },
  { id: 'winter', label: '겨울' },
  { id: 'christmas', label: '크리스마스' },
  { id: 'valentine', label: '발렌타인' },
  { id: 'parents-day', label: '어버이날' },
]

export const PROPS: Prop[] = [
  { id: 'book', label: '책' },
  { id: 'flower', label: '꽃' },
  { id: 'wood', label: '나무' },
  { id: 'stone', label: '돌' },
  { id: 'fabric', label: '패브릭' },
  { id: 'tray', label: '트레이' },
  { id: 'coffee', label: '커피' },
  { id: 'perfume', label: '향수' },
  { id: 'none', label: '없음' },
]
