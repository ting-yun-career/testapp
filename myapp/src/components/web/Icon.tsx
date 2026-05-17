export type IconType = 'calendar' | 'calendar-small' | 'clock' | 'chevron-left' | 'chevron-right'

type IconProps = {
  type: IconType
  size?: number
}

export default function Icon({ type, size = 20 }: IconProps) {
  if (type === 'calendar') {
    return (
      <svg fill="none" height={size} viewBox="0 0 22 22" width={size}>
        <rect height="15" rx="2" stroke="currentColor" strokeWidth="1.5" width="16" x="3" y="4" />
        <path d="M3 8h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 2v4M15 2v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        <rect fill="currentColor" height="2" rx="0.5" width="2" x="7" y="11" />
        <rect fill="currentColor" height="2" rx="0.5" width="2" x="10" y="11" />
        <rect fill="currentColor" height="2" rx="0.5" width="2" x="13" y="11" />
        <rect fill="currentColor" height="2" rx="0.5" width="2" x="7" y="14" />
        <rect fill="currentColor" height="2" rx="0.5" width="2" x="10" y="14" />
      </svg>
    )
  }

  if (type === 'calendar-small') {
    return (
      <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
        <rect height="15" rx="3" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" />
        <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  if (type === 'clock') {
    return (
      <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    )
  }

  if (type === 'chevron-left') {
    return (
      <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
        <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    )
  }

  if (type === 'chevron-right') {
    return (
      <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
        <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    )
  }
}
