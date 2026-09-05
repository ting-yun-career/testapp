/* ==========================================================================
   hero.js — hero video handling
   --------------------------------------------------------------------------
   Markup contract:
     section.hero[data-hero]
       img.hero__still            always present, shown until the video plays
       video.hero__video[data-hero-video]
       button[data-hero-mute][aria-pressed]   optional
   What this does:
     1. Reveals the video only on 'playing' — a blocked, missing or slow video
        never shows a black rectangle; the still stays.
     2. Pauses the video when the hero scrolls out of view (saves battery and
        data on phones, which is most of this site's traffic).
     3. Honours prefers-reduced-motion: video stays paused, still stays.
     4. Wires the optional mute toggle, and hides it if the file has no audio.
   ========================================================================== */

export function init() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const video = hero.querySelector("[data-hero-video]");
  if (!video) return;

  const mute = hero.querySelector("[data-hero-mute]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // --- 1. reveal on successful playback -----------------------------------
  video.addEventListener("playing", () => { hero.dataset.videoReady = "true"; }, { once: true });
  video.addEventListener("error", () => {
    console.warn("[silver4] hero video failed to load — showing still image.");
  });

  if (prefersReducedMotion.matches) {
    video.removeAttribute("autoplay");
    video.pause();
    mute?.remove();
    return;
  }

  // Safari/iOS occasionally rejects the autoplay promise; the still covers it.
  video.play?.().catch(() => {});

  // --- 2. pause offscreen --------------------------------------------------
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) video.play?.().catch(() => {});
      else video.pause();
    },
    { threshold: 0.15 }
  ).observe(hero);

  // --- 4. mute toggle ------------------------------------------------------
  if (!mute) return;

  // Hide the control if the source has no audio track — no point offering it.
  video.addEventListener("loadeddata", () => {
    const silent =
      video.mozHasAudio === false ||
      (typeof video.webkitAudioDecodedByteCount === "number" &&
        video.webkitAudioDecodedByteCount === 0);
    if (silent) mute.hidden = true;
  });

  mute.addEventListener("click", () => {
    video.muted = !video.muted;
    mute.setAttribute("aria-pressed", String(video.muted));
  });
}
