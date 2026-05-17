import Icon from './web/Icon'

export type NavView = 'calendar'

type NavItem = {
  id: NavView
  label: string
}

type BottomNavProps = {
  active: NavView
  onChange: (view: NavView) => void
}

const NAV_ITEMS: NavItem[] = [{ id: 'calendar', label: 'Calendar' }]

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/8 bg-neutral-900/95 px-2 py-1 shadow-2xl backdrop-blur-md">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active
        return (
          <button
            aria-label={item.label}
            className={`flex h-8 w-10 items-center justify-center rounded-lg transition-colors ${
              isActive
                ? 'text-white border border-white/30'
                : 'text-white/40 hover:bg-white/6 hover:text-white/70'
            }`}
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <Icon size={20} type={item.id} />
          </button>
        )
      })}
    </nav>
  )
}
