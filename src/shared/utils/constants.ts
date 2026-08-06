export const APP_NAME = "DataMaster Pro"
export const APP_TAGLINE = "ETL & SQL Knowledge Base"

export const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "LayoutDashboard", section: "getting-started", order: 0 },
  { path: "/qa", label: "Q&A", icon: "HelpCircle", section: "getting-started", order: 1 },
  { path: "/sql-sandbox", label: "SQL Sandbox", icon: "Terminal", section: "tools", order: 2 },
  { path: "/code-library", label: "Code Library", icon: "BookOpen", section: "tools", order: 3 },
  { path: "/etl-workflows", label: "ETL Workflows", icon: "GitBranch", section: "tools", order: 4 },
  { path: "/troubleshooting", label: "Troubleshooting", icon: "Wrench", section: "tools", order: 5 },
  { path: "/performance-analyzer", label: "Performance Analyzer", icon: "BarChart3", section: "tools", order: 6 },
  { path: "/schema-validator", label: "Schema Validator", icon: "Table2", section: "tools", order: 7 },
] as const

export const DIFFICULTY_COLORS = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
} as const

export const STORAGE_KEYS = {
  BOOKMARKS: "datamaster-bookmarks",
  THEME: "datamaster-theme",
  QUERY_HISTORY: "datamaster-query-history",
  QUERY_TABS: "datamaster-query-tabs",
  SIDEBAR: "datamaster-sidebar",
  TROUBLE_HISTORY: "datamaster-trouble-history",
  APP_STATS: "datamaster-app-stats",
} as const
