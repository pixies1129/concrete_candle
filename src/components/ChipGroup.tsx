interface ChipGroupProps<T extends string> {
  items: { id: T; label: string }[]
  isActive: (id: T) => boolean
  onSelect: (id: T) => void
  className?: string
}

export function ChipGroup<T extends string>({ items, isActive, onSelect, className = 'prop-grid' }: ChipGroupProps<T>) {
  return (
    <div className={className}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`chip${isActive(item.id) ? ' active' : ''}`}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
