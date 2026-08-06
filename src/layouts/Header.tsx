import { useNavigate } from "react-router-dom"
import { Menu, Sun, Moon, Terminal, ShieldCheck, Home } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { useAppStore } from "@/stores"
import { useTheme } from "@/shared/hooks/useTheme"

export function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="h-14 border-b border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0 text-white/80 hover:text-white hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex items-center gap-2">
          <Terminal className="h-5 w-5 text-white" />
          <span className="text-sm font-semibold tracking-tight text-white">DataMaster Pro</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-xs gap-1.5 text-white/80 hover:text-white hover:bg-white/10 border border-white/15"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Landing Page</span>
        </Button>

        <Badge variant="outline" className="hidden md:flex items-center gap-1.5 py-1 px-2.5 text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>100% In-Browser & Privacy First</span>
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-white/80 hover:text-white hover:bg-white/10"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  )
}
