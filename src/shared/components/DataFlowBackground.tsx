import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  pulseSpeed: number
}

interface Node {
  x: number
  y: number
  label: string
  type: "source" | "transform" | "sink"
  radius: number
  active: boolean
}

export function DataFlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let animationId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const isMobile = width < 768
    const particleCount = isMobile ? 25 : 55

    // Generate lightweight data particles
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.4 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }))

    // Data Pipeline Nodes for visual background
    const nodes: Node[] = [
      { x: width * 0.15, y: height * 0.25, label: "CSV / SQL", type: "source", radius: 4, active: true },
      { x: width * 0.45, y: height * 0.35, label: "SQLite WASM", type: "transform", radius: 5, active: true },
      { x: width * 0.8, y: height * 0.2, label: "Multi-DDL", type: "sink", radius: 4, active: true },
      { x: width * 0.25, y: height * 0.7, label: "Data Profiler", type: "transform", radius: 4, active: false },
      { x: width * 0.7, y: height * 0.75, label: "ETL Pipelines", type: "sink", radius: 5, active: true },
    ]

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize, { passive: true })

    let time = 0

    const render = () => {
      time += 0.015
      ctx.clearRect(0, 0, width, height)

      // Draw Grid Lines (Subtle background data grid)
      const gridSize = isMobile ? 60 : 80
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)"
      ctx.lineWidth = 1

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw Connection lines between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = isMobile ? 100 : 160

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.15
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`
            ctx.lineWidth = 0.75
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Update & Draw Particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        p.alpha += Math.sin(time * 2) * p.pulseSpeed * 0.1
        const currentAlpha = Math.max(0.1, Math.min(0.6, p.alpha))

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw Data Node Connections (ETL Visual Flow)
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 6])
      ctx.lineDashOffset = -time * 20

      nodes.forEach((node, idx) => {
        const nextNode = nodes[(idx + 1) % nodes.length]
        const gradient = ctx.createLinearGradient(node.x, node.y, nextNode.x, nextNode.y)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)")
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")

        ctx.strokeStyle = gradient
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(nextNode.x, nextNode.y)
        ctx.stroke()
      })

      ctx.setLineDash([])

      // Draw Data Nodes
      nodes.forEach((node) => {
        const pulse = Math.sin(time * 3) * 2
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + (node.active ? pulse * 0.5 : 0), 0, Math.PI * 2)
        ctx.fill()

        // Outer aura
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + 6 + pulse, 0, Math.PI * 2)
        ctx.stroke()
      })

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none select-none">
      {/* Canvas Particle & ETL Pipeline Network */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Ambient Gradient Glows (Vercel/Linear style glass aurora) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-white/[0.03] via-white/[0.06] to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-white/[0.02] to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-white/[0.04] to-transparent rounded-full blur-[110px] pointer-events-none" />

      {/* Top & Bottom Dark Fades */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-80 pointer-events-none" />
    </div>
  )
}
