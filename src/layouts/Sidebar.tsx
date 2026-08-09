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
  Gauge,
  HelpCircle,
  ShieldCheck,
  Wrench,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/shared/utils/cn"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
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
  Gauge,
  HelpCircle,
  ShieldCheck,
  Wrench,
}

interface NavItem {
  path: string
  label: string
  icon: string
  section: string
  order: number
}

const navItems: NavItem[] = [
  { path: "/app", label: "Dashboard Overview", icon: "LayoutDashboard", section: "overview", order: 0 },
  { path: "/sql-sandbox", label: "CSV & SQL Sandbox", icon: "Terminal", section: "utilities", order: 1 },
  { path: "/ddl-generator", label: "CSV to DDL Generator", icon: "FileCode", section: "utilities", order: 2 },
  { path: "/data-profiler", label: "Data Profiler", icon: "BarChart3", section: "utilities", order: 3 },
  { path: "/schema-diff", label: "Schema Diff", icon: "GitCompare", section: "utilities", order: 4 },
  { path: "/sql-formatter", label: "SQL Formatter", icon: "AlignLeft", section: "utilities", order: 5 },
  { path: "/code-library", label: "Snippet Vault", icon: "BookOpen", section: "utilities", order: 6 },
  { path: "/etl-workflows", label: "ETL Architecture DAGs", icon: "GitBranch", section: "utilities", order: 7 },
  { path: "/performance-analyzer", label: "Performance Analyzer", icon: "Gauge", section: "advanced", order: 8 },
  { path: "/schema-validator", label: "Schema Validator", icon: "ShieldCheck", section: "advanced", order: 9 },
  { path: "/qa", label: "Data QA Checks", icon: "HelpCircle", section: "advanced", order: 10 },
  { path: "/troubleshooting", label: "Troubleshooting Guide", icon: "Wrench", section: "advanced", order: 11 },
]

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  utilities: "Micro-SaaS Tools",
  advanced: "Diagnostics & QA",
}

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const mobileNavOpen = useAppStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    utilities: true,
    advanced: true,
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
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Drawer (Left Slide-Over) */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-40 w-72 bg-[#0d0d0d] border-r border-white/10 text-white transition-transform duration-300 ease-in-out flex flex-col shadow-2xl overflow-hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-white flex items-center justify-center shrink-0">
              <Terminal className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight truncate">
              DataMaster Pro
            </span>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <ScrollArea className="flex-1 px-3 py-3">
          {Object.entries(sections).map(([sectionKey, items]) => (
            <div key={sectionKey} className="mb-4">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="flex items-center gap-1 w-full px-2 py-1.5 font-mono text-[10px] font-semibold text-white/50 uppercase tracking-[0.15em] hover:text-white transition-colors"
              >
                {expandedSections[sectionKey] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                {sectionLabels[sectionKey]}
              </button>
              {expandedSections[sectionKey] && (
                <div className="space-y-0.5 mt-1">
                  {items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                      const Icon = iconMap[item.icon]
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileNavOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                              isActive
                                ? "bg-white/15 text-white font-medium border border-white/15 shadow-sm"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            )
                          }
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0 text-white/90" />}
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      )
                    })}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-0 z-30 h-full border-r border-white/10 bg-[#0d0d0d] text-white transition-all duration-300 flex-col overflow-hidden select-none",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        {/* Desktop Sidebar Header */}
        <div
          className={cn(
            "flex items-center h-14 border-b border-white/10 shrink-0 px-3",
            sidebarOpen ? "justify-start gap-2.5" : "justify-center"
          )}
        >
          <div className="h-7 w-7 rounded bg-white flex items-center justify-center shrink-0">
            <Terminal className="h-4 w-4 text-black" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-sm text-white tracking-tight truncate">
              DataMaster Pro
            </span>
          )}
        </div>

        {/* Desktop Sidebar Nav Scroll Area */}
        <ScrollArea className="flex-1 px-2 py-3">
          {Object.entries(sections).map(([sectionKey, items]) => (
            <div key={sectionKey} className="mb-4">
              {sidebarOpen ? (
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="flex items-center gap-1 w-full px-2 py-1.5 font-mono text-[10px] font-semibold text-white/50 uppercase tracking-[0.15em] hover:text-white transition-colors truncate"
                >
                  {expandedSections[sectionKey] ? (
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  )}
                  <span className="truncate">{sectionLabels[sectionKey]}</span>
                </button>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}

              {(sidebarOpen ? expandedSections[sectionKey] : true) && (
                <div className="space-y-1 mt-1">
                  {items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                      const Icon = iconMap[item.icon]
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={sidebarOpen ? undefined : item.label}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center rounded-lg transition-all duration-200",
                              sidebarOpen
                                ? "gap-3 px-3 py-2 text-sm"
                                : "justify-center h-10 w-10 mx-auto text-sm",
                              isActive
                                ? "bg-white/15 text-white font-medium border border-white/15 shadow-sm"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            )
                          }
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0 text-white/90" />}
                          {sidebarOpen && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      )
                    })}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </aside>
    </>
  )
}
