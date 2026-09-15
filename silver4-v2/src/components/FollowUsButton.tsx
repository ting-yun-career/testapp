import { SOCIAL_LINKS } from '../data/site'

export function FollowUsButton() {
  return (
    <div className="flex justify-center px-6 py-6">
      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noreferrer"
        className="bg-ink px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85"
      >
        Follow @silver4salon
      </a>
    </div>
  )
}
