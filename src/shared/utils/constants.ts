export const APP_NAME = "DataMaster Pro"
export const APP_TAGLINE = "ETL & SQL Knowledge Base"

export const NAV_ITEMS = [
  { path: "/app", label: "Dashboard Overview", icon: "LayoutDashboard", section: "overview", order: 0 },
  { path: "/sql-sandbox", label: "CSV & SQL Sandbox", icon: "Terminal", section: "utilities", order: 1 },
  { path: "/ddl-generator", label: "CSV to DDL Generator", icon: "FileCode", section: "utilities", order: 2 },
  { path: "/data-profiler", label: "Data Profiler", icon: "BarChart3", section: "utilities", order: 3 },
  { path: "/test-data-generator", label: "Mock Data Generator", icon: "Sparkles", section: "utilities", order: 4 },
  { path: "/currency-converter", label: "Live FX & Currency", icon: "DollarSign", section: "utilities", order: 5 },
  { path: "/schema-diff", label: "Schema Diff", icon: "GitCompare", section: "utilities", order: 6 },
  { path: "/sql-formatter", label: "SQL Formatter", icon: "AlignLeft", section: "utilities", order: 7 },
  { path: "/code-library", label: "Snippet Vault", icon: "BookOpen", section: "utilities", order: 8 },
  { path: "/etl-workflows", label: "ETL Architecture DAGs", icon: "GitBranch", section: "utilities", order: 9 },
  { path: "/snowflake-stage-generator", label: "Snowflake Stage & Copy", icon: "Cloud", section: "etl_cloud", order: 10 },
  { path: "/dbt-model-generator", label: "dbt Model & Schema", icon: "Layers", section: "etl_cloud", order: 11 },
  { path: "/airflow-dag-generator", label: "Airflow Python DAG", icon: "Workflow", section: "etl_cloud", order: 12 },
  { path: "/informatica-mapping-to-sql", label: "Informatica XML to SQL", icon: "FileCode", section: "etl_cloud", order: 13 },
  { path: "/informatica-expression-transpiler", label: "Informatica Expression", icon: "Code2", section: "etl_cloud", order: 14 },
  { path: "/performance-analyzer", label: "Performance Analyzer", icon: "Gauge", section: "advanced", order: 15 },
  { path: "/schema-validator", label: "Schema Validator", icon: "ShieldCheck", section: "advanced", order: 16 },
  { path: "/qa", label: "Data QA Checks", icon: "HelpCircle", section: "advanced", order: 17 },
  { path: "/troubleshooting", label: "Troubleshooting Guide", icon: "Wrench", section: "advanced", order: 18 },
  { path: "/db2-sas-ddl-generator", label: "DB2 & SAS Parameter Resolver", icon: "Database", section: "advanced", order: 19 },
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
