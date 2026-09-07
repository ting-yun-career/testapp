import { Container } from '../layout'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { useHeroVideo, type HeroVideoSource } from '../../hooks/useHeroVideo'
import { BOOKING_URL, SERVICES_URL } from '../../lib/constants'

const STILL_URL = 'https://silver4salon.com/asset/salon/DSC00993_comp.jpg'

// Plays in order, then loops back to the start — hero1 -> hero2 -> hero3 -> hero1 -> ...
const HERO_VIDEOS: HeroVideoSource[] = [
  { mobile: '/video/hero-mobile.mp4', desktop: '/video/hero.mp4' },
  { mobile: '/video/hero2-mobile.mp4', desktop: '/video/hero2.mp4' },
  { mobile: '/video/hero3-mobile.mp4', desktop: '/video/hero3.mp4' },
]

/* ==========================================================================
   Hero — full-bleed video with overlaid copy. Ported from .hero in
   05-sections.css + js/hero.js.
   public/video/hero*.mp4 (1920x1080) and hero*-mobile.mp4 (960x540) are the
   compressed, no-audio clips; the still image below stays the fallback —
   useHeroVideo only reveals the video once it truly plays, so there is
   never a black box.
   ========================================================================== */
export function Hero() {
  const { heroRef, videoRef, videoReady, muted, muteHidden, toggleMute, currentSrc } =
    useHeroVideo(HERO_VIDEOS)

  return (
    <section
      ref={heroRef}
      className="relative flex items-center min-h-[calc(100svh-4.25rem-4rem)] md:min-h-[calc(100svh-4.25rem)] overflow-hidden bg-ink text-paper"
    >
      <div className="absolute inset-0 z-0">
        <img
          className="absolute inset-0 w-full h-full object-cover [filter:brightness(0.85)_saturate(0.9)] animate-hero-drift"
          src={STILL_URL}
          alt="The Silver4 Salon floor in Vancouver"
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster={STILL_URL}
          src={currentSrc}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgb(10_9_8/55%)_0%,rgb(10_9_8/20%)_55%,rgb(10_9_8/0%)_100%),linear-gradient(to_top,rgb(10_9_8/100%)_0%,rgb(10_9_8/88%)_40%,rgb(10_9_8/50%)_100%)]"
      />

      <Container narrow className="relative z-10 flex flex-col gap-6 items-center text-center py-16">
        <h1 className="font-marker text-3xl text-paper">
          More than a haircut.
          <br />
          An <em className="not-italic text-accent-soft">experience</em>.
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="light" href={BOOKING_URL} target="_blank" rel="noopener">
            Book an appointment
          </Button>
          <Button variant="ghost-light" href={SERVICES_URL} target="_blank" rel="noopener">
            Browse services
          </Button>
        </div>
      </Container>

      {!muteHidden && (
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          className="absolute z-10 right-[clamp(1.25rem,0.75rem+2.5vw,3rem)] bottom-6 grid place-items-center w-11 h-11 border border-white/45 rounded-full text-paper transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:bg-white/18"
        >
          <span className="sr-only">Toggle sound</span>
          <Icon name={muted ? 'volume_off' : 'volume_up'} />
        </button>
      )}

      <Icon
        name="keyboard_arrow_down"
        className="hidden md:block absolute z-10 left-1/2 bottom-4 -translate-x-1/2 text-white/70 animate-hero-cue"
      />
    </section>
  )
}
