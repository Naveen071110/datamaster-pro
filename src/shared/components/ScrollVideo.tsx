import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
  posterUrl?: string
}

export function ScrollVideo({ videoUrl, posterUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true
    video.autoplay = true

    let animationFrameId: number
    let targetProgress = 0
    let smoothedProgress = 0
    let isSeeking = false
    let hasStarted = false

    // Fallback timer if video takes > 4s to load (slow mobile network)
    const fallbackTimer = setTimeout(() => {
      if (!isReady) {
        setUseFallback(true)
      }
    }, 4000)

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

    const render = () => {
      const delta = targetProgress - smoothedProgress
      // Frame-rate aware smooth lerp
      const lerpFactor = Math.min(0.35, 0.12 + Math.abs(delta) * 0.45)
      smoothedProgress += delta * lerpFactor

      if (video.duration && !isNaN(video.duration) && video.readyState >= 2) {
        const targetTime = smoothedProgress * (video.duration - 0.05)
        if (!isSeeking && Math.abs(video.currentTime - targetTime) > 0.02) {
          isSeeking = true
          video.currentTime = targetTime
          const onSeekEnd = () => {
            video.removeEventListener("seeked", onSeekEnd)
            isSeeking = false
          }
          video.addEventListener("seeked", onSeekEnd)
          // Shorter safety timeout for 120Hz/144Hz high refresh displays
          setTimeout(() => { isSeeking = false }, 40)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const startLoop = () => {
      if (hasStarted) return
      hasStarted = true
      clearTimeout(fallbackTimer)
      setIsReady(true)
      render()
    }

    video.play().then(() => {
      video.pause()
    }).catch(() => {})

    video.load()

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

      {/* Hardware Accelerated Native Video Element with CSS object-cover */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        playsInline
        autoPlay
        preload="auto"
        crossOrigin="anonymous"
        className={`w-full h-full object-cover transition-opacity duration-700 pointer-events-none will-change-transform ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60 pointer-events-none" />
    </div>
  )
}
