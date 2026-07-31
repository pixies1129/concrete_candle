import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: string
  title: string
  children: ReactNode
}

export function EmptyState({ icon, title, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-sub">{children}</p>
    </div>
  )
}
