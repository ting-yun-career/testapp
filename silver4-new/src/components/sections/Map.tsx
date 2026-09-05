import { useState } from 'react'
import { Icon } from '../Icon'
import { MAP_EMBED_SRC } from '../../lib/constants'

/** Click-to-load Google Maps embed — ported from .map + js/map.js. Keeps the
    ~500KB third-party iframe off the critical path until the visitor asks
    for it. */
export function Map() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative aspect-[16/10] md:aspect-video bg-paper-alt overflow-hidden">
      {loaded ? (
        <iframe
          className="w-full h-full border-0"
          src={MAP_EMBED_SRC}
          title="Map showing Silver4 Hair &amp; Beauty Salon"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 w-full bg-paper-alt text-ink-soft text-sm tracking-wide uppercase"
        >
          <Icon name="location_on" className="text-[2.5rem] text-accent" />
          <span>Load map · Silver4 Hair &amp; Beauty Salon</span>
        </button>
      )}
    </div>
  )
}
