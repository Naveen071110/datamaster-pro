import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
}

export function ScrollVideo({ videoUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")
    let animationFrameId: number
    let targetProgress = 0
    let smoothedProgress = 0

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        targetProgress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })

    const render = () => {
      // Lerp smoothed progress
      smoothedProgress += (targetProgress - smoothedProgress) * 0.12

      if (video.duration && !isNaN(video.duration)) {
        const targetTime = smoothedProgress * (video.duration - 0.05)
        if (Math.abs(video.currentTime - targetTime) > 0.03) {
          video.currentTime = targetTime
        }
      }

      if (ctx && video.readyState >= 2) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const canvasWidth = window.innerWidth * dpr
        const canvasHeight = window.innerHeight * dpr

        // Object-cover math
        const vWidth = video.videoWidth || 1920
        const vHeight = video.videoHeight || 1080
        const vAspect = vWidth / vHeight
        const cAspect = canvasWidth / canvasHeight

        let drawW = canvasWidth
        let drawH = canvasHeight
        let offsetX = 0
        let offsetY = 0

        if (cAspect > vAspect) {
          drawH = canvasWidth / vAspect
          offsetY = (canvasHeight - drawH) / 2
        } else {
          drawW = canvasHeight * vAspect
          offsetX = (canvasWidth - drawW) / 2
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        ctx.drawImage(video, offsetX, offsetY, drawW, drawH)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const onLoadedData = () => {
      setIsLoaded(true)
      render()
    }

    video.addEventListener("loadeddata", onLoadedData)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("scroll", handleScroll)
      video.removeEventListener("loadeddata", onLoadedData)
      cancelAnimationFrame(animationFrameId)
    }
  }, [videoUrl])

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        playsInline
        preload="auto"
        className="hidden"
      />
      {/* Scrubbed Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Grain / Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60 pointer-events-none" />
    </div>
  )
}
