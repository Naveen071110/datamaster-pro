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
  Sparkles,
  DollarSign,
  Cloud,
  Layers,
  Workflow,
  Code2,
  Database,
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
  Sparkles,
  DollarSign,
  Cloud,
  Layers,
  Workflow,
  Code2,
  Database,
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
  
  // Micro-SaaS Tools
  { path: "/sql-sandbox", label: "CSV & SQL Sandbox", icon: "Terminal", section: "utilities", order: 1 },
  { path: "/ddl-generator", label: "CSV to DDL Generator", icon: "FileCode", section: "utilities", order: 2 },
  { path: "/data-profiler", label: "Data Profiler", icon: "BarChart3", section: "utilities", order: 3 },
  { path: "/test-data-generator", label: "Mock Data Generator", icon: "Sparkles", section: "utilities", order: 4 },
  { path: "/currency-converter", label: "Live FX & Currency", icon: "DollarSign", section: "utilities", order: 5 },
  { path: "/schema-diff", label: "Schema Diff", icon: "GitCompare", section: "utilities", order: 6 },
  { path: "/sql-formatter", label: "SQL Formatter", icon: "AlignLeft", section: "utilities", order: 7 },
  { path: "/code-library", label: "Snippet Vault", icon: "BookOpen", section: "utilities", order: 8 },
  { path: "/etl-workflows", label: "ETL Architecture DAGs", icon: "GitBranch", section: "utilities", order: 9 },
  
  // ETL & Cloud Data Suite (Informatica, Snowflake, dbt, Airflow)
  { path: "/snowflake-stage-generator", label: "Snowflake Stage & Copy", icon: "Cloud", section: "etl_cloud", order: 10 },
  { path: "/dbt-model-generator", label: "dbt Model & Schema", icon: "Layers", section: "etl_cloud", order: 11 },
  { path: "/airflow-dag-generator", label: "Airflow Python DAG", icon: "Workflow", section: "etl_cloud", order: 12 },
  { path: "/informatica-mapping-to-sql", label: "Informatica XML to SQL", icon: "FileCode", section: "etl_cloud", order: 13 },
  { path: "/informatica-expression-transpiler", label: "Informatica Expression", icon: "Code2", section: "etl_cloud", order: 14 },

  // Diagnostics & QA
  { path: "/performance-analyzer", label: "Performance Analyzer", icon: "Gauge", section: "advanced", order: 15 },
  { path: "/schema-validator", label: "Schema Validator", icon: "ShieldCheck", section: "advanced", order: 16 },
  { path: "/qa", label: "Data QA Checks", icon: "HelpCircle", section: "advanced", order: 17 },
  { path: "/troubleshooting", label: "Troubleshooting Guide", icon: "Wrench", section: "advanced", order: 18 },
  { path: "/db2-sas-ddl-generator", label: "DB2 & SAS Parameter Resolver", icon: "Database", section: "advanced", order: 19 },
]

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  utilities: "Micro-SaaS Tools",
  etl_cloud: "ETL & Cloud Data Suite",
  advanced: "Diagnostics & QA",
}

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const mobileNavOpen = useAppStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    utilities: true,
    etl_cloud: true,
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
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {Object.entries(sections).map(([sectionKey, items]) => (
              <div key={sectionKey} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-white/40 uppercase">
                  {sectionLabels[sectionKey] || sectionKey}
                </div>
                {items.map((item) => {
                  const Icon = iconMap[item.icon] || FileCode
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                          isActive
                            ? "bg-white text-black font-semibold shadow-sm"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed inset-y-0 left-0 z-30 bg-[#0d0d0d] border-r border-white/10 text-white flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded bg-white flex items-center justify-center shrink-0">
              <Terminal className="h-4 w-4 text-black" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-sm text-white tracking-tight truncate">
                DataMaster Pro
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-2 py-3">
          <div className="space-y-5">
            {Object.entries(sections).map(([sectionKey, items]) => (
              <div key={sectionKey} className="space-y-1">
                {sidebarOpen ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={expandedSections[sectionKey]}
                    aria-label={`Toggle ${sectionLabels[sectionKey] || sectionKey} section`}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider text-white/40 uppercase hover:text-white/70 transition-colors"
                  >
                    <span>{sectionLabels[sectionKey] || sectionKey}</span>
                    {expandedSections[sectionKey] ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                ) : (
                  <div className="h-px bg-white/10 my-2 mx-1" />
                )}

                {(!sidebarOpen || expandedSections[sectionKey]) &&
                  items.map((item) => {
                    const Icon = iconMap[item.icon] || FileCode
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        title={!sidebarOpen ? item.label : undefined}
                        aria-label={item.label}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                            isActive
                              ? "bg-white text-black font-semibold shadow-sm"
                              : "text-white/70 hover:bg-white/10 hover:text-white",
                            !sidebarOpen && "justify-center px-0"
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    )
                  })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
