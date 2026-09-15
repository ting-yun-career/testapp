import { ExpandableImage } from './ExpandableImage'

interface Photo {
  src: string
  alt: string
}

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
      {photos.map((photo, index) => (
        <ExpandableImage
          key={photo.src + index}
          src={photo.src}
          alt={photo.alt}
          className="aspect-3/4 h-full w-full object-cover"
        />
      ))}
    </div>
  )
}
