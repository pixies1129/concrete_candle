import { OUTPUT_TARGETS } from '../data/catalog'
import type { AspectRatio, OutputTargetId } from '../types'

interface OutputTargetSelectorProps {
  target: OutputTargetId
  aspectRatio: AspectRatio
  onChange: (target: OutputTargetId, aspectRatio: AspectRatio) => void
}

export function OutputTargetSelector({ target, aspectRatio, onChange }: OutputTargetSelectorProps) {
  const current = OUTPUT_TARGETS.find((t) => t.id === target)

  return (
    <div>
      <div className="target-grid">
        {OUTPUT_TARGETS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`target-card${t.id === target ? ' active' : ''}`}
            onClick={() => onChange(t.id, t.aspectRatios[0])}
          >
            <span className="target-label">{t.label}</span>
            <span className="target-desc">{t.description}</span>
          </button>
        ))}
      </div>

      {current && current.aspectRatios.length > 1 && (
        <div className="aspect-row">
          {current.aspectRatios.map((ar) => (
            <button
              key={ar}
              type="button"
              className={`chip${ar === aspectRatio ? ' active' : ''}`}
              onClick={() => onChange(target, ar)}
            >
              {ar}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
