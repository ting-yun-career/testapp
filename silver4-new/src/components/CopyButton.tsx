import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

/** ported from js/copy.js — copies `value`, briefly swapping the icon to a
    checkmark to confirm. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      data-copied={copied || undefined}
      className="grid place-items-center w-9 h-9 shrink-0 text-sm transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:text-accent-soft data-[copied]:text-accent-soft"
    >
      <Icon name={copied ? 'check' : 'content_copy'} className="text-[1.375rem]" />
    </button>
  )
}
