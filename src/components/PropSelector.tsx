import { PROPS } from '../data/catalog'
import type { PropId } from '../types'
import { ChipGroup } from './ChipGroup'

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

  return <ChipGroup items={PROPS} isActive={(id) => selected.includes(id)} onSelect={toggle} />
}
