import { PROPS } from '../data/catalog'
import type { PropId } from '../types'

interface PropSelectorProps {
  selected: PropId[]
  onChange: (selected: PropId[]) => void
}

export function PropSelector({ selected, onChange }: PropSelectorProps) {
  const toggle = (id: PropId) => {
    if (id === 'none') {
      onChange(['none'])
      return
    }
    const withoutNone = selected.filter((p) => p !== 'none')
    if (withoutNone.includes(id)) {
      onChange(withoutNone.filter((p) => p !== id))
    } else {
      onChange([...withoutNone, id])
    }
  }

  return (
    <div className="prop-grid">
      {PROPS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`chip${selected.includes(p.id) ? ' active' : ''}`}
          onClick={() => toggle(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
