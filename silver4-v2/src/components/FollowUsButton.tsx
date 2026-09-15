import { SOCIAL_LINKS } from "../data/site";

export function FollowUsButton() {
  return (
    <div className="flex justify-center px-[var(--gap_width)] py-[var(--gap_width)]">
      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noreferrer"
        className="bg-ink px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85"
      >
        Follow Us
      </a>
    </div>
  );
}
