import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Terminal,
  FileCode,
  BarChart3,
  Menu,
} from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { useAppStore } from "@/stores"

const items = [
  { path: "/app", icon: LayoutDashboard, label: "Overview" },
  { path: "/sql-sandbox", icon: Terminal, label: "SQL WASM" },
  { path: "/ddl-generator", icon: FileCode, label: "DDL Gen" },
  { path: "/data-profiler", icon: BarChart3, label: "Profiler" },
]

export function MobileNav() {
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0d0d0d]/95 backdrop-blur-md px-2 py-1">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200",
                isActive
                  ? "text-white bg-white/15 border border-white/15"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}

        {/* More button to open drawer */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <Menu className="h-4 w-4 text-white" />
          <span>More</span>
        </button>
      </div>
    </nav>
  )
}
