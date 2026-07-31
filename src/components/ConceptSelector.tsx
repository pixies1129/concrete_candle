import { CONCEPTS, SEASONS } from '../data/catalog'
import type { ConceptId, SeasonId } from '../types'
import { ChipGroup } from './ChipGroup'

interface ConceptSelectorProps {
  concept: ConceptId
  season?: SeasonId
  onChangeConcept: (concept: ConceptId) => void
  onChangeSeason: (season: SeasonId) => void
}

export function ConceptSelector({ concept, season, onChangeConcept, onChangeSeason }: ConceptSelectorProps) {
  return (
    <div>
      <div className="concept-grid">
        {CONCEPTS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`concept-card${c.id === concept ? ' active' : ''}`}
            onClick={() => onChangeConcept(c.id)}
          >
            <span className="concept-code">{c.code}</span>
            <div className="concept-label">{c.label}</div>
            <div className="concept-desc">{c.description}</div>
          </button>
        ))}
      </div>

      {concept === 'seasonal' && (
        <div style={{ marginTop: 12 }}>
          <ChipGroup items={SEASONS} isActive={(id) => id === season} onSelect={onChangeSeason} />
        </div>
      )}
    </div>
  )
}
