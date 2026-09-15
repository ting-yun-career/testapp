interface WordmarkProps {
  tone?: 'dark' | 'light'
  className?: string
}

export function Wordmark({ tone = 'dark', className = '' }: WordmarkProps) {
  const textColor = tone === 'dark' ? 'text-ink' : 'text-white'

  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className={`font-sans text-lg font-bold tracking-tight ${textColor}`}>SILVER4</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
        Hair & Rituals
      </span>
    </span>
  )
}
