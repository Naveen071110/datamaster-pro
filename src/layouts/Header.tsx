import { Menu, Sun, Moon, Terminal, ShieldCheck } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { useAppStore } from "@/stores"
import { useTheme } from "@/shared/hooks/useTheme"

export function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">DataMaster Pro</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden md:flex items-center gap-1.5 py-1 px-2.5 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>100% In-Browser & Privacy First</span>
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
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
