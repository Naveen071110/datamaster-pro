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

    // Mobile & Web WebKit / Blink video initialization
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
    let isSeeking = false

    const TOTAL_FRAMES = 60
    const frameArray: (ImageBitmap | null)[] = new Array(TOTAL_FRAMES).fill(null)

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = window.innerWidth || document.documentElement.clientWidth || 360
      const h = window.innerHeight || document.documentElement.clientHeight || 640
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
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
    handleScroll()

    // Pre-computed Frame Cache Extraction Loop
    const extractFrames = async () => {
      if (isExtracting || !video.duration || isNaN(video.duration)) return
      isExtracting = true

      const offCanvas = document.createElement("canvas")
      const offCtx = offCanvas.getContext("2d")

      // Scaled width for high performance & crisp rendering (1024px)
      const scale = Math.min(1, 1024 / (video.videoWidth || 1920))
      const targetW = Math.round((video.videoWidth || 1920) * scale)
      const targetH = Math.round((video.videoHeight || 1080) * scale)
      offCanvas.width = targetW
      offCanvas.height = targetH

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const time = (i / (TOTAL_FRAMES - 1)) * (video.duration - 0.05)
        try {
          video.currentTime = time
          await new Promise((res) => {
            const onSeek = () => {
              video.removeEventListener("seeked", onSeek)
              res(true)
            }
            video.addEventListener("seeked", onSeek)
            setTimeout(res, 90) // Mobile & Desktop seek safety limit
          })

          if (offCtx) {
            offCtx.drawImage(video, 0, 0, targetW, targetH)
            const bitmap = await createImageBitmap(offCanvas)
            frameArray[i] = bitmap
          }
        } catch {
          // ignore extraction error
        }
      }
    }

    const render = () => {
      // Smooth dynamic lerp
      const delta = targetProgress - smoothedProgress
      const lerpFactor = Math.min(0.3, 0.12 + Math.abs(delta) * 0.35)
      smoothedProgress += delta * lerpFactor

      if (ctx) {
        const canvasWidth = canvas.width
        const canvasHeight = canvas.height

        const targetIndex = Math.min(
          Math.floor(smoothedProgress * TOTAL_FRAMES),
          TOTAL_FRAMES - 1
        )
        const cachedBitmap = frameArray[targetIndex]

        let source: CanvasImageSource | null = null

        if (cachedBitmap) {
          source = cachedBitmap
        } else if (video.readyState >= 2) {
          const targetTime = smoothedProgress * (video.duration - 0.05)
          // Guard video seeking so currentTime is not spammed on rAF tick
          if (!isSeeking && Math.abs(video.currentTime - targetTime) > 0.04) {
            isSeeking = true
            video.currentTime = targetTime
            const onSeekEnd = () => {
              video.removeEventListener("seeked", onSeekEnd)
              isSeeking = false
            }
            video.addEventListener("seeked", onSeekEnd)
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
          // Ambient background fallback while video loads
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

    // Trigger WebKit play/pause to unlock decoder
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
      frameArray.forEach((bm) => bm?.close())
    }
  }, [videoUrl])

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Offscreen video element */}
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
