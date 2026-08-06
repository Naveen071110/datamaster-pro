import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Terminal,
  BookOpen,
  HelpCircle,
  GitBranch,
  Wrench,
  BarChart3,
  Table2,
} from "lucide-react"
import { cn } from "@/shared/utils/cn"

const items = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/sql-sandbox", icon: Terminal, label: "SQL" },
  { path: "/code-library", icon: BookOpen, label: "Code" },
  { path: "/qa", icon: HelpCircle, label: "Q&A" },
  { path: "/etl-workflows", icon: GitBranch, label: "ETL" },
  { path: "/troubleshooting", icon: Wrench, label: "Fix" },
  { path: "/performance-analyzer", icon: BarChart3, label: "Perf" },
  { path: "/schema-validator", icon: Table2, label: "Schema" },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card">
      <div className="flex overflow-x-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] min-w-[48px] flex-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate max-w-full">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
