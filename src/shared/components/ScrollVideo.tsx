import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
  posterUrl?: string
}

/**
 * ScrollVideo — Smooth Scroll-Scrubbed Video Background.
 *
 * Direct video timeline scrubbing synced to page scroll position:
 * - 0% Scroll = 0.0s video timestamp
 * - 100% Scroll = End of video duration
 * - Uses throttled lerp (exponential smoothing) for 60 FPS fluidity.
 * - Touch shield overlay blocks ALL native mobile play/pause button popups.
 */
export function ScrollVideo({ videoUrl, posterUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Configure video attributes for silent background scrubbing
    video.muted = true
    video.playsInline = true
    video.setAttribute("webkit-playsinline", "true")
    video.setAttribute("x5-playsinline", "true")
    video.setAttribute("disablePictureInPicture", "true")
    video.setAttribute("disableRemotePlayback", "true")
    video.setAttribute("x-webkit-airplay", "deny")
    video.preload = "auto"

    let animationFrameId: number
    let targetProgress = 0
    let smoothedProgress = 0
    let lastSeekTime = 0
    let isMounted = true

    // Calculate scroll progress (0 to 1)
    const handleScroll = () => {
      const scrollElement = document.scrollingElement || document.documentElement
      const maxScroll = scrollElement.scrollHeight - window.innerHeight
      if (maxScroll > 0) {
        targetProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    handleScroll()

    // Smooth scrub loop (syncs video.currentTime to page scroll position)
    const render = () => {
      if (!isMounted) return

      // Exponential lerp (0.12 factor gives quick, fluid scroll response)
      const delta = targetProgress - smoothedProgress
      smoothedProgress += delta * 0.12

      if (video.duration && !isNaN(video.duration) && video.readyState >= 2) {
        // Map 0..1 progress to video duration (leaving 0.05s buffer at end)
        const targetTime = smoothedProgress * (video.duration - 0.05)
        const now = performance.now()

        // Seek threshold: seek only if delta > 0.03s, not currently seeking, and at least 32ms between seeks
        // This gives hardware video decoders ~30 FPS decode window = zero lag, ultra-fluid frame scrubbing
        if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.03 && now - lastSeekTime > 32) {
          video.currentTime = Math.max(0, Math.min(targetTime, video.duration - 0.05))
          lastSeekTime = now
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    // Prime the video decoder with a brief play-pause sequence
    const primeDecoder = () => {
      if (!isMounted) return
      setIsReady(true)

      // Play briefly then pause so the decoder prepares keyframes in GPU memory
      video
        .play()
        .then(() => {
          setTimeout(() => {
            if (isMounted) {
              video.pause()
              handleScroll()
              render()
            }
          }, 60)
        })
        .catch(() => {
          // Autoplay blocked — still works via manual scroll scrubbing
          if (isMounted) {
            handleScroll()
            render()
          }
        })
    }

    if (video.readyState >= 2) {
      primeDecoder()
    } else {
      video.addEventListener("loadeddata", primeDecoder, { once: true })
      video.addEventListener("canplaythrough", primeDecoder, { once: true })
    }

    video.load()

    return () => {
      isMounted = false
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      video.removeEventListener("loadeddata", primeDecoder)
      video.removeEventListener("canplaythrough", primeDecoder)
      cancelAnimationFrame(animationFrameId)
    }
  }, [videoUrl])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none select-none"
    >
      {/* Poster Fallback Image */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${
            isReady ? "opacity-0" : "opacity-70"
          }`}
        />
      )}

      {/* Video Element — frame-scrubbed by scroll position */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
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
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />

      {/* Touch Shield Overlay — intercepts touches before they can reach video DOM node */}
      <div
        className="absolute inset-0 z-10 pointer-events-auto bg-transparent"
        aria-hidden="true"
      />

      {/* Cinematic Vignette Gradient Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a] pointer-events-none" />
    </div>
  )
}
