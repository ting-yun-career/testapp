import { Icon } from '../Icon'

/** Gallery lightbox shell — markup/styles ported from .lightbox in
    05-sections.css, kept as an inert shell for structural parity: the
    hand-off's js/gallery.js never implemented the open/close behaviour
    either (see its file header), so clicking a gallery image falls through
    to the full-size image today, and this stays permanently hidden. */
export function Lightbox() {
  return (
    <div
      hidden
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image"
      className="fixed inset-0 z-[300] place-items-center p-6 bg-[rgb(10_9_8/94%)]"
    >
      <img className="max-w-[min(100%,68rem)] max-h-[82svh] object-contain" src="" alt="" />
      <p className="mt-4 text-center text-sm text-white/70" />
      <button
        type="button"
        className="absolute top-6 right-6 grid place-items-center w-12 h-12 text-paper border border-white/30 rounded-full transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-white/18"
      >
        <span className="sr-only">Close</span>
        <Icon name="close" />
      </button>
      <button
        type="button"
        className="absolute left-4 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 text-paper border border-white/30 rounded-full transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-white/18"
      >
        <span className="sr-only">Previous image</span>
        <Icon name="arrow_back" />
      </button>
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 text-paper border border-white/30 rounded-full transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-white/18"
      >
        <span className="sr-only">Next image</span>
        <Icon name="arrow_forward" />
      </button>
    </div>
  )
}
