import { useEffect, useRef, useState, useCallback } from "react"

interface ScrollVideoProps {
  videoUrl: string
  posterUrl?: string
}

export function ScrollVideo({ videoUrl, posterUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const isMobileRef = useRef(false)

  // Detect mobile once
  useEffect(() => {
    isMobileRef.current = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  }, [])

  const startCanvasLoop = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return () => {}

    let rafId: number
    const draw = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        // Set canvas size to match video (only on first frame or resize)
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        ctx.drawImage(video, 0, 0)
      }
      rafId = requestAnimationFrame(draw)
    }
    draw()

    return () => cancelAnimationFrame(rafId)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!video || !canvas || !container) return

    const isMobile = isMobileRef.current

    // Configure video for silent autoplay loop
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.setAttribute("webkit-playsinline", "true")
    video.setAttribute("disablePictureInPicture", "true")
    video.setAttribute("disableRemotePlayback", "true")
    video.setAttribute("x-webkit-airplay", "deny")
    video.preload = "auto"
    // Slow down for a cinematic feel
    video.playbackRate = 0.6

    let hasStarted = false
    let cleanupCanvas = () => {}

    // Fallback timer if video takes > 5s to load
    const fallbackTimer = setTimeout(() => {
      if (!hasStarted) {
        setUseFallback(true)
      }
    }, 5000)

    // Scroll-based visual effects (parallax + opacity)
    let scrollRaf: number
    const handleScroll = () => {
      cancelAnimationFrame(scrollRaf)
      scrollRaf = requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const viewH = window.innerHeight
        // Normalize scroll: 0 at top, 1 at ~2x viewport height
        const progress = Math.min(scrollY / (viewH * 2), 1)

        // Subtle parallax shift (moves up slightly as user scrolls down)
        const translateY = progress * -8 // max 8% shift
        // Fade out gently as user scrolls past hero
        const opacity = 1 - progress * 0.5 // fades to 50% opacity

        container.style.transform = `translate3d(0, ${translateY}%, 0)`
        container.style.opacity = String(Math.max(opacity, 0.15))
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    const startPlayback = () => {
      if (hasStarted) return
      hasStarted = true
      clearTimeout(fallbackTimer)

      // On mobile: render video frames to canvas (eliminates native controls)
      if (isMobile) {
        cleanupCanvas = startCanvasLoop(video, canvas)
      }

      setIsReady(true)

      // Start autoplay loop
      video.play().catch(() => {
        // Autoplay was blocked — show poster fallback
        setUseFallback(true)
      })
    }

    if (video.readyState >= 2) {
      startPlayback()
    } else {
      video.addEventListener("loadeddata", startPlayback, { once: true })
      video.addEventListener("canplaythrough", startPlayback, { once: true })
    }

    return () => {
      clearTimeout(fallbackTimer)
      cancelAnimationFrame(scrollRaf)
      cleanupCanvas()
      window.removeEventListener("scroll", handleScroll)
      video.removeEventListener("loadeddata", startPlayback)
      video.removeEventListener("canplaythrough", startPlayback)
      video.pause()
    }
  }, [videoUrl, startCanvasLoop])

  const isMobile = isMobileRef.current

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none will-change-transform"
      style={{ transition: "opacity 0.3s ease-out" }}
    >
      {/* Poster Fallback Image */}
      {posterUrl && useFallback && (
        <img
          src={posterUrl}
          alt="Background"
          className="w-full h-full object-cover opacity-80 pointer-events-none"
        />
      )}

      {/* Video Element — autoplay loop, hidden on mobile */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        {...{ "webkit-playsinline": "true" } as Record<string, string>}
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-1000 ${
          isReady && !isMobile ? "opacity-100" : "opacity-0"
        }`}
        style={isMobile ? { position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", zIndex: -1 } : undefined}
      />

      {/* Canvas Element — renders video frames on mobile (zero native UI controls) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-1000 ${
          isMobile && isReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60 pointer-events-none" />
    </div>
  )
}
