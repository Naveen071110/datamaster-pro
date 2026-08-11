import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
  posterUrl?: string
}

export function ScrollVideo({ videoUrl, posterUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Configure video attributes to strictly disable controls & picture-in-picture
    video.muted = true
    video.playsInline = true
    video.setAttribute("webkit-playsinline", "true")
    video.setAttribute("disablePictureInPicture", "true")
    video.setAttribute("disableRemotePlayback", "true")
    video.setAttribute("x-webkit-airplay", "deny")
    video.preload = "auto"

    let animationFrameId: number
    let targetProgress = 0
    let smoothedProgress = 0
    let lastSeekTime = 0

    // Passive scroll listener for max performance
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

    // Smooth lerp loop with throttled non-blocking video currentTime updates
    const render = () => {
      // Exponential smooth lerp
      const delta = targetProgress - smoothedProgress
      smoothedProgress += delta * 0.1

      if (video.duration && !isNaN(video.duration) && video.readyState >= 2) {
        const targetTime = smoothedProgress * (video.duration - 0.05)
        const now = performance.now()

        // Seek only if time difference is meaningful (> 0.04s) and at least 35ms since last seek
        // This prevents CPU/GPU decoder lock and creates butter-smooth scrubbing
        if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.04 && now - lastSeekTime > 35) {
          video.currentTime = targetTime
          lastSeekTime = now
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const onCanPlay = () => {
      setIsReady(true)
      render()
    }

    if (video.readyState >= 2) {
      onCanPlay()
    } else {
      video.addEventListener("loadeddata", onCanPlay, { once: true })
      video.addEventListener("canplaythrough", onCanPlay, { once: true })
    }

    // Force load
    video.load()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      video.removeEventListener("loadeddata", onCanPlay)
      video.removeEventListener("canplaythrough", onCanPlay)
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
          alt="Background"
          className={`w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
            isReady ? "opacity-0" : "opacity-80"
          }`}
        />
      )}

      {/* Hardware-Accelerated Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        playsInline
        {...{ "webkit-playsinline": "true" } as Record<string, string>}
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-1000 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />

      {/* Invisible Shield Overlay — completely blocks touch/mouse events to prevent play/pause button overlays */}
      <div className="absolute inset-0 bg-transparent pointer-events-none z-10" />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/70 pointer-events-none z-20" />
    </div>
  )
}
