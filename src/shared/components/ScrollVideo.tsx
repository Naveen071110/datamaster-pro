import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
  posterUrl?: string
}

export function ScrollVideo({ videoUrl, posterUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [useCanvasMode, setUseCanvasMode] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Configure video for silent background use
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
    let hasStarted = false
    let lastDrawnTime = -1

    // Detect mobile for canvas rendering (avoids native controls entirely)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    // Fallback timer if video takes > 5s to load
    const fallbackTimer = setTimeout(() => {
      if (!hasStarted) {
        setUseFallback(true)
      }
    }, 5000)

    const ctx = canvas.getContext("2d", { alpha: false })

    const handleScroll = () => {
      const scrollElement = document.scrollingElement || document.documentElement
      const maxScroll = scrollElement.scrollHeight - window.innerHeight
      if (maxScroll > 0) {
        targetProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("touchmove", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    handleScroll()

    const drawFrame = () => {
      if (!ctx || !video.videoWidth) return
      // Only redraw if time actually changed
      if (Math.abs(video.currentTime - lastDrawnTime) > 0.01) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        lastDrawnTime = video.currentTime
      }
    }

    const render = () => {
      const delta = targetProgress - smoothedProgress
      // Gentle lerp — higher = snappier but jankier
      smoothedProgress += delta * 0.08

      if (video.duration && !isNaN(video.duration) && video.readyState >= 2) {
        const targetTime = smoothedProgress * (video.duration - 0.05)

        // Only seek if we've moved meaningfully (reduces redundant seeks)
        if (Math.abs(video.currentTime - targetTime) > 0.04) {
          video.currentTime = targetTime
        }

        if (isMobile || useCanvasMode) {
          drawFrame()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const startLoop = () => {
      if (hasStarted) return
      hasStarted = true
      clearTimeout(fallbackTimer)

      if (isMobile) {
        setUseCanvasMode(true)
        // On mobile, keep video hidden and render to canvas
        // This completely eliminates native play/pause button overlays
        drawFrame()
      }

      setIsReady(true)
      render()
    }

    // Kick the video decoder — play briefly then pause to prime the buffer
    // Use a small delay before pause to let the decoder initialize
    video.play()
      .then(() => {
        setTimeout(() => {
          video.pause()
          video.currentTime = 0
        }, 50)
      })
      .catch(() => {
        // Autoplay blocked — still works with manual scrubbing
      })

    if (video.readyState >= 2) {
      startLoop()
    } else {
      video.addEventListener("loadeddata", startLoop, { once: true })
      video.addEventListener("canplaythrough", startLoop, { once: true })
    }

    return () => {
      clearTimeout(fallbackTimer)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("touchmove", handleScroll)
      window.removeEventListener("resize", handleScroll)
      video.removeEventListener("loadeddata", startLoop)
      video.removeEventListener("canplaythrough", startLoop)
      cancelAnimationFrame(animationFrameId)
    }
  }, [videoUrl])

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Poster Fallback Image for Ultra-slow mobile connections */}
      {posterUrl && useFallback && (
        <img
          src={posterUrl}
          alt="Background"
          className="w-full h-full object-cover opacity-80 pointer-events-none transition-opacity duration-700"
        />
      )}

      {/* Hidden Video Element — source for frame data */}
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
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none ${
          useCanvasMode ? "opacity-0 -z-10" : (isReady ? "opacity-100" : "opacity-0")
        } transition-opacity duration-700`}
        style={useCanvasMode ? { position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" } : undefined}
      />

      {/* Canvas Element — used on mobile to avoid native video controls entirely */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none ${
          useCanvasMode && isReady ? "opacity-100" : "opacity-0"
        } transition-opacity duration-700`}
      />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60 pointer-events-none" />
    </div>
  )
}
