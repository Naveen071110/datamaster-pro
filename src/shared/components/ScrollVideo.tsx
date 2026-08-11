import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
  posterUrl?: string
}

/**
 * ScrollVideo — Premium scroll-scrubbed video background component.
 *
 * Design decisions informed by nextlevelbuilder/ui-ux-pro-max-skill:
 * - Uses autoplay loop at slow playback rate (not raw currentTime seeking)
 *   because H.264 compressed video seeking is inherently janky (keyframe decode overhead).
 * - GSAP-style scrub smoothing via numeric lerp (equivalent to scrub: 0.5).
 * - Respects prefers-reduced-motion: falls back to static poster.
 * - x5-playsinline for WeChat/Tencent X5 browser compatibility.
 * - Touch shield overlay div above video to block ALL native control overlays on mobile.
 * - Composite-only GPU animations (transform + opacity only, no layout properties).
 */
export function ScrollVideo({ videoUrl, posterUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect prefers-reduced-motion (accessibility requirement per ux.csv)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    // If user prefers reduced motion, show poster only — no video playback
    if (prefersReducedMotion) {
      setIsReady(false)
      return
    }

    // Configure video for silent background autoplay (per skill mobile requirements)
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.setAttribute("webkit-playsinline", "true")
    video.setAttribute("x5-playsinline", "true")        // WeChat/Tencent X5 browser
    video.setAttribute("disablePictureInPicture", "true")
    video.setAttribute("disableRemotePlayback", "true")
    video.setAttribute("x-webkit-airplay", "deny")
    video.preload = "auto"

    // Slow cinematic playback — smooth native decoding, no seeking jank
    video.playbackRate = 0.5

    let animationFrameId: number
    let hasStarted = false

    // Scroll-driven parallax + opacity using composite-only GPU properties
    // (transform: translate3d + opacity — never top/left/width/height)
    let currentTranslateY = 0
    let currentOpacity = 1
    let targetTranslateY = 0
    let targetOpacity = 1

    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewH = window.innerHeight
      // Normalize: 0 at top → 1 at 2.5x viewport height
      const progress = Math.min(scrollY / (viewH * 2.5), 1)

      // GPU-accelerated parallax: subtle upward drift
      targetTranslateY = progress * -12 // max 12% vertical shift
      // Smooth opacity fade as user scrolls past hero
      targetOpacity = 1 - progress * 0.6 // fades to 40% minimum
    }

    // GSAP-style scrub smoothing loop (equivalent to scrub: 0.5)
    // Uses exponential lerp at ~60fps for buttery-smooth scroll response
    const smoothLoop = () => {
      // Lerp factor 0.06 = equivalent to GSAP scrub: ~0.5 smoothness
      currentTranslateY += (targetTranslateY - currentTranslateY) * 0.06
      currentOpacity += (targetOpacity - currentOpacity) * 0.06

      container.style.transform = `translate3d(0, ${currentTranslateY}%, 0)`
      container.style.opacity = String(Math.max(currentOpacity, 0.15))

      animationFrameId = requestAnimationFrame(smoothLoop)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    const startPlayback = () => {
      if (hasStarted) return
      hasStarted = true
      setIsReady(true)
      smoothLoop()

      // JS autoplay rescue (per skill recommendation)
      video.play().catch(() => {
        // Autoplay blocked by mobile browser policy — poster fallback visible
        setIsReady(false)
      })
    }

    if (video.readyState >= 2) {
      startPlayback()
    } else {
      video.addEventListener("loadeddata", startPlayback, { once: true })
      video.addEventListener("canplaythrough", startPlayback, { once: true })
    }

    // Force load to start buffering immediately
    video.load()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      video.removeEventListener("loadeddata", startPlayback)
      video.removeEventListener("canplaythrough", startPlayback)
      cancelAnimationFrame(animationFrameId)
      video.pause()
    }
  }, [videoUrl, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none select-none will-change-transform"
    >
      {/* Poster Fallback — shown while loading or when prefers-reduced-motion is active */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
            isReady ? "opacity-0" : "opacity-60"
          }`}
        />
      )}

      {/* Background Video Element — autoplay loop, never seeking */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        {...{
          "webkit-playsinline": "true",
          "x5-playsinline": "true",
        } as Record<string, string>}
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-1000 ${
          isReady && !prefersReducedMotion ? "opacity-100" : "opacity-0"
        }`}
        style={{
          // Force disable any remaining native touch interaction
          pointerEvents: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />

      {/*
       * CRITICAL: Touch Shield Overlay (per ui-ux-pro-max-skill mobile guidelines)
       *
       * This transparent div sits ABOVE the video in the z-order.
       * pointer-events-auto ensures ALL touch/click events are intercepted
       * by this shield BEFORE they can reach the <video> element underneath.
       * This physically prevents mobile browsers (iOS Safari, Chrome Android,
       * Samsung Internet) from showing native play/pause button overlays,
       * because touch events never reach the video DOM node.
       */}
      <div
        className="absolute inset-0 z-10"
        style={{
          pointerEvents: "auto",
          touchAction: "auto",
          background: "transparent",
        }}
        aria-hidden="true"
      />

      {/* Cinematic Vignette Overlay — dark gradient for text contrast ≥ 4.5:1 */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a] pointer-events-none" />
    </div>
  )
}
