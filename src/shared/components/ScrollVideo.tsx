import { useEffect, useRef, useState } from "react"

interface ScrollVideoProps {
  videoUrl: string
}

export function ScrollVideo({ videoUrl }: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
    }

    let animationFrameId: number
    let targetProgress = 0
    let smoothedProgress = 0
    let isExtracting = false
    const frameCache: ImageBitmap[] = []

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

    // Progressive Frame Extraction (Up to 120 frames for ultra-smooth 60Hz - 144Hz displays)
    const extractFramesProgressively = async () => {
      if (isExtracting || !video.duration) return
      isExtracting = true

      const totalFrames = Math.min(120, Math.floor(video.duration * 20))
      const offCanvas = document.createElement("canvas")
      const offCtx = offCanvas.getContext("2d")

      // High-res 1280px extraction width for crisp visual quality
      const scale = Math.min(1, 1280 / (video.videoWidth || 1920))
      const targetW = Math.round((video.videoWidth || 1920) * scale)
      const targetH = Math.round((video.videoHeight || 1080) * scale)
      offCanvas.width = targetW
      offCanvas.height = targetH

      for (let i = 0; i < totalFrames; i++) {
        const time = (i / (totalFrames - 1)) * (video.duration - 0.05)
        video.currentTime = time
        await new Promise((res) => {
          const onSeek = () => {
            video.removeEventListener("seeked", onSeek)
            res(true)
          }
          video.addEventListener("seeked", onSeek)
        })

        if (offCtx) {
          offCtx.drawImage(video, 0, 0, targetW, targetH)
          try {
            const bitmap = await createImageBitmap(offCanvas)
            frameCache.push(bitmap)
          } catch {
            // fallback
          }
        }
      }
    }

    const render = () => {
      // Adaptive Dynamic Lerp Engine: Instant tracking on fast scroll, ultra-silky on slow scroll
      const delta = targetProgress - smoothedProgress
      const adaptiveLerp = Math.min(0.35, 0.16 + Math.abs(delta) * 0.4)
      smoothedProgress += delta * adaptiveLerp

      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const canvasWidth = window.innerWidth * dpr
        const canvasHeight = window.innerHeight * dpr

        let source: CanvasImageSource | null = null

        if (frameCache.length > 0) {
          const idx = Math.min(
            Math.floor(smoothedProgress * frameCache.length),
            frameCache.length - 1
          )
          source = frameCache[idx]
        } else if (video.readyState >= 2) {
          const targetTime = smoothedProgress * (video.duration - 0.05)
          if (Math.abs(video.currentTime - targetTime) > 0.03) {
            video.currentTime = targetTime
          }
          source = video
        }

        if (source) {
          const vWidth = (source as HTMLVideoElement).videoWidth || (source as ImageBitmap).width || 1920
          const vHeight = (source as HTMLVideoElement).videoHeight || (source as ImageBitmap).height || 1080
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

          ctx.drawImage(source, offsetX, offsetY, drawW, drawH)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const onLoadedData = () => {
      setIsReady(true)
      render()
      extractFramesProgressively()
    }

    if (video.readyState >= 2) {
      onLoadedData()
    } else {
      video.addEventListener("loadeddata", onLoadedData)
    }

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("scroll", handleScroll)
      video.removeEventListener("loadeddata", onLoadedData)
      cancelAnimationFrame(animationFrameId)
      frameCache.forEach((bm) => bm.close?.())
    }
  }, [videoUrl])

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Offscreen Video Source */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        playsInline
        preload="auto"
        className="hidden"
      />

      {/* Render Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60 pointer-events-none" />
    </div>
  )
}
