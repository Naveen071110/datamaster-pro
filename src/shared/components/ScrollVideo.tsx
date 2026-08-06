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

    // Ensure mobile browsers initialize video decoding
    video.muted = true
    video.playsInline = true
    video.autoplay = true

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
      canvas.width = (window.innerWidth || document.documentElement.clientWidth || 360) * dpr
      canvas.height = (window.innerHeight || document.documentElement.clientHeight || 640) * dpr
    }
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    window.addEventListener("orientationchange", updateCanvasSize)

    const handleScroll = () => {
      const scrollElement = document.scrollingElement || document.documentElement
      const maxScroll = scrollElement.scrollHeight - window.innerHeight
      if (maxScroll > 0) {
        targetProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("touchmove", handleScroll, { passive: true })

    // Frame Extraction Loop
    const extractFrames = async () => {
      if (isExtracting || !video.duration || isNaN(video.duration)) return
      isExtracting = true

      const totalFrames = Math.min(80, Math.floor(video.duration * 12))
      const offCanvas = document.createElement("canvas")
      const offCtx = offCanvas.getContext("2d")

      // Mobile optimized downscaling (960px max width)
      const scale = Math.min(1, 960 / (video.videoWidth || 1920))
      const targetW = Math.round((video.videoWidth || 1920) * scale)
      const targetH = Math.round((video.videoHeight || 1080) * scale)
      offCanvas.width = targetW
      offCanvas.height = targetH

      for (let i = 0; i < totalFrames; i++) {
        const time = (i / (totalFrames - 1)) * (video.duration - 0.05)
        try {
          video.currentTime = time
          await new Promise((res) => {
            const onSeek = () => {
              video.removeEventListener("seeked", onSeek)
              res(true)
            }
            video.addEventListener("seeked", onSeek)
            setTimeout(res, 80) // Safety timeout for mobile seek delays
          })

          if (offCtx) {
            offCtx.drawImage(video, 0, 0, targetW, targetH)
            const bitmap = await createImageBitmap(offCanvas)
            frameCache.push(bitmap)
          }
        } catch {
          // ignore extraction error
        }
      }
    }

    const render = () => {
      // Smooth lerp
      const delta = targetProgress - smoothedProgress
      const lerpFactor = Math.min(0.35, 0.16 + Math.abs(delta) * 0.4)
      smoothedProgress += delta * lerpFactor

      if (ctx) {
        const canvasWidth = canvas.width
        const canvasHeight = canvas.height

        let source: CanvasImageSource | null = null

        if (frameCache.length > 0) {
          const idx = Math.min(
            Math.floor(smoothedProgress * frameCache.length),
            frameCache.length - 1
          )
          source = frameCache[idx]
        } else if (video.readyState >= 2) {
          const targetTime = smoothedProgress * (video.duration - 0.05)
          if (Math.abs(video.currentTime - targetTime) > 0.04) {
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
        } else {
          // Ambient mobile fallback background while loading video frames
          ctx.fillStyle = "#0a0a0a"
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const onVideoReady = () => {
      setIsReady(true)
      render()
      extractFrames()
    }

    // Trigger video load on mobile WebKit
    video.play().then(() => {
      video.pause()
    }).catch(() => {})

    if (video.readyState >= 2) {
      onVideoReady()
    } else {
      video.addEventListener("loadeddata", onVideoReady)
      video.addEventListener("canplay", onVideoReady)
    }

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("orientationchange", updateCanvasSize)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("touchmove", handleScroll)
      video.removeEventListener("loadeddata", onVideoReady)
      video.removeEventListener("canplay", onVideoReady)
      cancelAnimationFrame(animationFrameId)
      frameCache.forEach((bm) => bm.close?.())
    }
  }, [videoUrl])

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Offscreen video element styled to prevent iOS WebKit suspend */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        playsInline
        autoPlay
        preload="auto"
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
      />

      {/* Render Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isReady ? "opacity-100" : "opacity-90"
        }`}
      />

      {/* Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60 pointer-events-none" />
    </div>
  )
}
