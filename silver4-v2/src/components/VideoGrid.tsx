interface Video {
  src: string
  label: string
}

export function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-2 gap-[var(--gap_width)] desktop:grid-cols-6">
      {videos.map((video) => (
        <video
          key={video.src}
          src={video.src}
          aria-label={video.label}
          className="aspect-3/4 w-full bg-cream object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ))}
    </div>
  )
}
