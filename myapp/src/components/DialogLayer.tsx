import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type DialogLayerProps = {
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  title?: ReactNode
}

export default function DialogLayer({
  children,
  footer,
  onClose,
  title,
}: DialogLayerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="dialog-layer" onClick={onClose} role="presentation">
      <section
        aria-modal="true"
        className="dialog-layer__panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog-layer__body">
          {title ? <h2 className="dialog-layer__title">{title}</h2> : null}
          {children}
        </div>
        {footer ? <footer className="dialog-layer__footer">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  )
}
