import { Icon } from '../Icon'
import { BOOKING_URL, PHONE_TEL } from '../../lib/constants'

/** Fixed bottom Call / Text / Book row, phones only. Ported from .action-bar. */
export function ActionBar() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-[110] grid grid-cols-3 h-16 bg-ink border-t border-line-dark pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <a
        href={`tel:${PHONE_TEL}`}
        className="flex flex-col items-center justify-center gap-0.5 text-paper text-[0.625rem] tracking-wide uppercase transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-accent active:bg-accent"
      >
        <Icon name="call" className="text-[1.375rem]" />
        <span>Call</span>
      </a>
      <a
        href={`sms:${PHONE_TEL}`}
        className="flex flex-col items-center justify-center gap-0.5 text-paper text-[0.625rem] tracking-wide uppercase transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-accent active:bg-accent"
      >
        <Icon name="sms" className="text-[1.375rem]" />
        <span>Text</span>
      </a>
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener"
        className="flex flex-col items-center justify-center gap-0.5 bg-accent text-paper text-[0.625rem] tracking-wide uppercase transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-accent-soft hover:text-ink"
      >
        <Icon name="event_available" className="text-[1.375rem]" />
        <span>Book</span>
      </a>
    </nav>
  )
}
