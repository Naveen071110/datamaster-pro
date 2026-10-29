import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom"
import { AlertTriangle, RefreshCw, Home, Terminal, ShieldAlert } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export function RootErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  let title = "Application Runtime Exception"
  let message = "An unexpected error occurred while rendering this interface."
  let details: string | undefined = undefined

  if (isRouteErrorResponse(error)) {
    title = `${error.status} — ${error.statusText || "Route Error"}`
    message = error.data?.message || "The requested view could not be rendered or was not found."
  } else if (error instanceof Error) {
    message = error.message
    details = import.meta.env.DEV ? error.stack : undefined
  } else if (typeof error === "string") {
    message = error
  }

  const handleReset = () => {
    try {
      // Clear potentially corrupted workspace query cache
      const raw = localStorage.getItem("datamaster-pro-storage")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state) {
          parsed.state.activeTabId = null
          localStorage.setItem("datamaster-pro-storage", JSON.stringify(parsed))
        }
      }
    } catch {
      // Ignore
    }
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-xl w-full border border-red-500/20 bg-red-950/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
            <p className="text-xs text-red-400/80 font-mono mt-0.5">Isolated Workspace Safety Guard</p>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          {message}
        </p>

        {details && (
          <details className="mb-6 group">
            <summary className="text-xs font-mono text-white/50 cursor-pointer hover:text-white/80 transition-colors flex items-center gap-1.5 select-none">
              <Terminal className="h-3.5 w-3.5" />
              <span>Inspect Error Stack Trace</span>
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono text-red-300/80 overflow-x-auto max-h-48 scrollbar-thin">
              {details}
            </pre>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          <Button
            onClick={handleReset}
            className="bg-white text-black hover:bg-white/90 gap-2 font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Reload & Recover
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/app")}
            className="border-white/15 bg-white/5 hover:bg-white/10 text-white gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Studio
          </Button>
        </div>
      </div>
    </div>
  )
}
