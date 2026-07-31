import { OUTPUT_TARGETS } from '../data/catalog'
import type { AspectRatio, OutputTargetId } from '../types'
import { ChipGroup } from './ChipGroup'

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
        <ChipGroup
          className="aspect-row"
          items={current.aspectRatios.map((ar) => ({ id: ar, label: ar }))}
          isActive={(ar) => ar === aspectRatio}
          onSelect={(ar) => onChange(target, ar)}
        />
      )}
    </div>
  )
}
