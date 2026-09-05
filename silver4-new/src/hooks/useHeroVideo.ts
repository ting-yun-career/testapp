import { useEffect, useRef, useState } from 'react'

export interface HeroVideoSource {
  mobile: string
  desktop: string
}

/* ==========================================================================
   useHeroVideo — ported from js/hero.js, extended to play a playlist of
   clips back-to-back (e.g. hero1 -> hero2 -> hero1 -> ...) instead of a
   single looping file.
   1. Reveals the video only on the first clip's 'playing' event, so a
      blocked/missing/slow video never shows a black rectangle — the still
      stays until then.
   2. Pauses the video when the hero scrolls offscreen.
   3. Honours prefers-reduced-motion: video stays paused, still stays.
   4. Wires the optional mute toggle and hides it if the source is silent.
   5. Advances to the next source on 'ended', wrapping back to the start —
      the whole playlist loops indefinitely, not any single clip.
   ========================================================================== */
export function useHeroVideo(sources: HeroVideoSource[]) {
  const heroRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [muted, setMuted] = useState(true)
  // Lazy initializers: known synchronously at mount and never change for the
  // life of this component, so they aren't state derived inside an effect.
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [isMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [muteHidden, setMuteHidden] = useState(reducedMotion)
  const [index, setIndex] = useState(0)

  const currentSrc = isMobile ? sources[index].mobile : sources[index].desktop

  // Listeners + observer that live for the component's lifetime, independent
  // of which clip is currently loaded.
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

    const onEnded = () => {
      setIndex((i) => (i + 1) % sources.length)
    }
    video.addEventListener('ended', onEnded)

    if (reducedMotion) {
      video.removeAttribute('autoplay')
      video.pause()
      return () => {
        video.removeEventListener('playing', onPlaying)
        video.removeEventListener('error', onError)
        video.removeEventListener('ended', onEnded)
      }
    }

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
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('loadeddata', onLoadedData)
      observer.disconnect()
    }
  }, [reducedMotion, sources.length])

  // Load and play whenever the active clip changes (including the initial
  // mount) — <source> media-query selection only runs once per load(), so
  // switching clips means picking the right file in JS and reloading.
  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return
    video.load()
    video.play?.().catch(() => {})
  }, [currentSrc, reducedMotion])

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return { heroRef, videoRef, videoReady, muted, muteHidden, toggleMute, currentSrc }
}
