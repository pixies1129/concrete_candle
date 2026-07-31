import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/', label: '홈', icon: '⌂', end: true },
  { to: '/create', label: '만들기', icon: '✦', end: false },
  { to: '/gallery', label: '내 이미지', icon: '▣', end: false },
  { to: '/brand', label: '브랜드', icon: '◈', end: false },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
