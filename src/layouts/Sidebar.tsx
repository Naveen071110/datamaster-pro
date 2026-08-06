import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Terminal,
  FileCode,
  BarChart3,
  GitCompare,
  AlignLeft,
  BookOpen,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Bookmark,
  ShieldCheck,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/shared/utils/cn"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { useAppStore } from "@/stores"

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Terminal,
  FileCode,
  BarChart3,
  GitCompare,
  AlignLeft,
  BookOpen,
  GitBranch,
}

interface NavItem {
  path: string
  label: string
  icon: string
  section: string
  order: number
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard Overview", icon: "LayoutDashboard", section: "overview", order: 0 },
  { path: "/sql-sandbox", label: "CSV & SQL Sandbox", icon: "Terminal", section: "utilities", order: 1 },
  { path: "/ddl-generator", label: "CSV to DDL Generator", icon: "FileCode", section: "utilities", order: 2 },
  { path: "/data-profiler", label: "Data Profiler", icon: "BarChart3", section: "utilities", order: 3 },
  { path: "/schema-diff", label: "Schema Diff", icon: "GitCompare", section: "utilities", order: 4 },
  { path: "/sql-formatter", label: "SQL Formatter", icon: "AlignLeft", section: "utilities", order: 5 },
  { path: "/code-library", label: "Snippet Vault", icon: "BookOpen", section: "utilities", order: 6 },
  { path: "/etl-workflows", label: "ETL Architecture DAGs", icon: "GitBranch", section: "utilities", order: 7 },
]

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  utilities: "Micro-SaaS Tools",
}

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const bookmarks = useAppStore((s) => s.bookmarks)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "getting-started": true,
    tools: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-full border-r border-sidebar-border bg-sidebar transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-60" : "w-0 overflow-hidden md:w-16"
      )}
    >
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-2", !sidebarOpen && "md:justify-center md:w-full")}>
          <div className="h-7 w-7 rounded bg-primary flex items-center justify-center shrink-0">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-sm text-sidebar-foreground truncate">
              DataMaster Pro
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        {Object.entries(sections).map(([sectionKey, items]) => (
          <div key={sectionKey} className="mb-4">
            <button
              onClick={() => toggleSection(sectionKey)}
              className={cn(
                "flex items-center gap-1 w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors",
                !sidebarOpen && "md:sr-only"
              )}
            >
              {expandedSections[sectionKey] ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {sectionLabels[sectionKey]}
            </button>
            {(expandedSections[sectionKey] || !sidebarOpen) && (
              <div className={cn("space-y-0.5 mt-1", !sidebarOpen && "md:space-y-2 md:mt-2")}>
                {items
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const Icon = iconMap[item.icon]
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                            !sidebarOpen && "md:justify-center md:px-2"
                          )
                        }
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    )
                  })}
              </div>
            )}
          </div>
        ))}

        {sidebarOpen && bookmarks.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <Bookmark className="h-3 w-3" />
                Bookmarks ({bookmarks.length})
              </div>
              <div className="space-y-0.5">
                {bookmarks.slice(0, 5).map((bm) => (
                  <NavLink
                    key={bm.id}
                    to={bm.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-1.5 rounded-md text-xs transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )
                    }
                  >
                    <Bookmark className="h-3 w-3 shrink-0 fill-primary text-primary" />
                    <span className="truncate">{bm.title}</span>
                  </NavLink>
                ))}
                {bookmarks.length > 5 && (
                  <p className="text-xs text-muted-foreground px-3 pt-1">
                    +{bookmarks.length - 5} more
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </aside>
  )
}
