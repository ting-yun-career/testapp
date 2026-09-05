import { MAP_EMBED_SRC } from '../../lib/constants'

/** Google Maps embed — loads immediately with the page. */
export function Map() {
  return (
    <div className="relative aspect-[4/3] md:aspect-[3/2] bg-paper-alt overflow-hidden">
      <iframe
        className="w-full h-full border-0"
        src={MAP_EMBED_SRC}
        title="Map showing Silver4 Hair &amp; Beauty Salon"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}
