import { useEffect, useRef, useState } from 'react'

/* ==========================================================================
   useHeroVideo — ported from js/hero.js.
   1. Reveals the video only on 'playing' so a blocked/missing/slow video
      never shows a black rectangle — the still stays until then.
   2. Pauses the video when the hero scrolls offscreen.
   3. Honours prefers-reduced-motion: video stays paused, still stays.
   4. Wires the optional mute toggle and hides it if the source is silent.
   ========================================================================== */
export function useHeroVideo() {
  const heroRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [muted, setMuted] = useState(true)
  // Lazy initializer: known synchronously at mount and never changes for the
  // life of this component, so it isn't state derived inside an effect.
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [muteHidden, setMuteHidden] = useState(reducedMotion)

  useEffect(() => {
    const hero = heroRef.current
    const video = videoRef.current
    if (!hero || !video) return

    const onPlaying = () => setVideoReady(true)
    video.addEventListener('playing', onPlaying, { once: true })

    const onError = () => {
      console.warn('[silver4] hero video failed to load — showing still image.')
    }
    video.addEventListener('error', onError)

    if (reducedMotion) {
      video.removeAttribute('autoplay')
      video.pause()
      return () => {
        video.removeEventListener('playing', onPlaying)
        video.removeEventListener('error', onError)
      }
    }

    video.play?.().catch(() => {})

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play?.().catch(() => {})
        else video.pause()
      },
      { threshold: 0.15 },
    )
    observer.observe(hero)

    const onLoadedData = () => {
      const v = video as HTMLVideoElement & {
        mozHasAudio?: boolean
        webkitAudioDecodedByteCount?: number
      }
      const silent =
        v.mozHasAudio === false ||
        (typeof v.webkitAudioDecodedByteCount === 'number' && v.webkitAudioDecodedByteCount === 0)
      if (silent) setMuteHidden(true)
    }
    video.addEventListener('loadeddata', onLoadedData)

    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
      video.removeEventListener('loadeddata', onLoadedData)
      observer.disconnect()
    }
  }, [reducedMotion])

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return { heroRef, videoRef, videoReady, muted, muteHidden, toggleMute }
}
