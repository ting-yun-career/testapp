import { ExpandableImage } from './ExpandableImage'

interface Photo {
  src: string
  alt: string
}

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-2 gap-[var(--gap_width)] desktop:grid-cols-6">
      {photos.map((photo, index) => (
        <ExpandableImage
          key={photo.src + index}
          src={photo.src}
          alt={photo.alt}
          className="aspect-3/4 w-full object-cover"
        />
      ))}
    </div>
  )
}
