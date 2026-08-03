export type OutputTargetId =
  | 'smartstore-main'
  | 'detail-page'
  | 'instagram-feed'
  | 'instagram-story'
  | 'brand-editorial'

export interface OutputTarget {
  id: OutputTargetId
  label: string
  description: string
  aspectRatios: AspectRatio[]
}

export type AspectRatio = '1:1' | '4:5' | '9:16'

export type ConceptId =
  | 'minimal'
  | 'luxury'
  | 'natural'
  | 'cozy'
  | 'concrete'
  | 'dark-mood'
  | 'korean-minimal'
  | 'seasonal'

export interface Concept {
  id: ConceptId
  code: string
  label: string
  description: string
}

export type SeasonId =
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter'
  | 'christmas'
  | 'valentine'
  | 'parents-day'

export interface Season {
  id: SeasonId
  label: string
}

export type PropId = 'book' | 'flower' | 'wood' | 'stone' | 'fabric' | 'tray' | 'coffee' | 'perfume' | 'none'

export interface Prop {
  id: PropId
  label: string
}

export interface UploadedProduct {
  file: File
  previewUrl: string
  width: number
  height: number
}

export interface GenerationRequest {
  image: UploadedProduct
  target: OutputTargetId
  aspectRatio: AspectRatio
  concept: ConceptId
  season?: SeasonId
  props: PropId[]
}

export interface GeneratedImage {
  id: string
  url: string
  aspectRatio: AspectRatio
  concept: ConceptId
  liked?: boolean
}
