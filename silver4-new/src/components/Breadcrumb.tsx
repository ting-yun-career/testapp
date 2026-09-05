import { Link } from 'react-router-dom'

interface Crumb {
  label: string
  to?: string
}

/** ported from .breadcrumb in 05-sections.css — used inside the dark PageHeader. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap gap-x-2 gap-y-1 text-xs tracking-wide uppercase text-white/60"
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {item.to ? (
            <Link to={item.to} className="hover:text-accent-soft">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
          {i < items.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  )
}
