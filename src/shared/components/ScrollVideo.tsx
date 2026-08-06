import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
}

export function ScrollVideo({ videoUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)

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
      const lerpFactor = Math.min(0.35, 0.14 + Math.abs(delta) * 0.4)
      smoothedProgress += delta * lerpFactor

      if (video.duration && !isNaN(video.duration) && video.readyState >= 2) {
        const targetTime = smoothedProgress * (video.duration - 0.05)
        if (!isSeeking && Math.abs(video.currentTime - targetTime) > 0.03) {
          isSeeking = true
          video.currentTime = targetTime
          const onSeekEnd = () => {
            video.removeEventListener("seeked", onSeekEnd)
            isSeeking = false
          }
          video.addEventListener("seeked", onSeekEnd)
          setTimeout(() => { isSeeking = false }, 80) // Safety timeout
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const onVideoReady = () => {
      setIsReady(true)
      render()
    }

    video.play().then(() => {
      video.pause()
    }).catch(() => {})

    if (video.readyState >= 2) {
      onVideoReady()
    } else {
      video.addEventListener("loadeddata", onVideoReady)
      video.addEventListener("canplaythrough", onVideoReady)
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("touchmove", handleScroll)
      window.removeEventListener("resize", handleScroll)
      video.removeEventListener("loadeddata", onVideoReady)
      video.removeEventListener("canplaythrough", onVideoReady)
      cancelAnimationFrame(animationFrameId)
    }
  }, [videoUrl])

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Hardware Accelerated Native Video Element with CSS object-cover */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        playsInline
        autoPlay
        preload="auto"
        crossOrigin="anonymous"
        className={`w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60 pointer-events-none" />
    </div>
  )
}
