import { useEffect, useState, type ImgHTMLAttributes, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'

interface ExpandableImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  wrapperClassName?: string
}

export function ExpandableImage({
  src,
  alt,
  className,
  wrapperClassName,
  ...rest
}: ExpandableImageProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const stopPropagation = (event: MouseEvent) => event.stopPropagation()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block w-full cursor-zoom-in overflow-hidden ${wrapperClassName ?? ''}`}
        aria-label={`Expand image: ${alt}`}
      >
        <img src={src} alt={alt} className={className} {...rest} />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 desktop:p-10"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 text-4xl font-light leading-none text-white/80 transition-colors hover:text-white"
            >
              &times;
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full cursor-default object-contain"
              onClick={stopPropagation}
            />
          </div>,
          document.body,
        )}
    </>
  )
}
