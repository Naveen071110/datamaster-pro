import { useNavigate } from "react-router-dom"
import {
  Terminal,
  FileCode,
  BarChart3,
  GitCompare,
  AlignLeft,
  BookOpen,
  GitBranch,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react"

const microSaasTools = [
  {
    path: "/sql-sandbox",
    icon: Terminal,
    title: "01. CSV & SQL WASM Sandbox",
    description: "Execute ANSI SQL against custom uploaded CSVs or built-in datasets directly inside in-browser WebAssembly.",
    badge: "Interactive WASM Engine"
  },
  {
    path: "/ddl-generator",
    icon: FileCode,
    title: "02. Multi-Dialect DDL Generator",
    description: "Synthesize CREATE TABLE DDL & INSERT statements across Postgres, Snowflake, BigQuery, MySQL, and SQLite.",
    badge: "5 Dialects Supported"
  },
  {
    path: "/data-profiler",
    icon: BarChart3,
    title: "03. Data Profiler & Quality Check",
    description: "Automated dataset health check: NULL rates, cardinalities, numeric distributions, and quality anomaly warnings.",
    badge: "Automated Diagnostics"
  },
  {
    path: "/schema-diff",
    icon: GitCompare,
    title: "04. Schema Diff & Drift Inspector",
    description: "Side-by-side DDL schema comparator highlighting added (+), deleted (-), and modified (~) columns with ALTER TABLE SQL.",
    badge: "Auto Migration SQL"
  },
  {
    path: "/sql-formatter",
    icon: AlignLeft,
    title: "05. SQL Formatter & Beautifier",
    description: "Standardize raw queries, align clauses, and format keyword casing for clean, readable production SQL.",
    badge: "Syntax Beautifier"
  },
  {
    path: "/code-library",
    icon: BookOpen,
    title: "06. Snippet Vault",
    description: "50+ production-tested code snippets for SQL Window Functions, CTEs, Python ETL, PySpark, and Airflow.",
    badge: "50+ Snippets"
  },
  {
    path: "/etl-workflows",
    icon: GitBranch,
    title: "07. ETL Architecture DAG Builder",
    description: "Visual ReactFlow canvas to design, document, and visualize complex data pipeline workflow DAG architectures.",
    badge: "Visual DAG Canvas"
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto text-white">
      {/* Header Banner */}
      <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 sm:p-10 space-y-6 overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
              Developer Workbench
            </span>
          </div>

          <div className="flex items-center gap-2 border border-white/15 bg-white/5 rounded-full px-3 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/80">
              100% In-Browser & Privacy First
            </span>
          </div>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl font-normal leading-[1.1] tracking-tight text-white drop-shadow-lg">
            Clear. Precise.
            <br />
            Data Engineering.
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed drop-shadow max-w-2xl">
            Welcome to DataMaster Pro. Process CSVs, generate multi-dialect DDL, profile dataset quality, and build pipeline DAGs — 100% privately in your browser.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => navigate("/sql-sandbox")}
            className="rounded-full bg-white px-6 py-3 text-xs sm:text-sm font-medium text-black hover:bg-white/85 transition-colors duration-300 inline-flex items-center gap-2 shadow-lg"
          >
            <Terminal className="h-4 w-4" />
            <span>Launch CSV SQL Sandbox</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/ddl-generator")}
            className="rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-6 py-3 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <FileCode className="h-4 w-4 text-white/70" />
            <span>CSV to DDL Generator</span>
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
            Micro-SaaS Utilities
          </h2>
          <span className="font-mono text-xs text-white/50 uppercase tracking-[0.15em]">
            7 Active Utilities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {microSaasTools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.path}
                onClick={() => navigate(tool.path)}
                className="cursor-pointer group rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg border border-white/20 bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 border border-white/15 px-2.5 py-1 rounded bg-white/5">
                      {tool.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-white transition-colors">
                      {tool.title}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </div>

                  <p className="text-xs leading-relaxed text-white/70 mt-2.5">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50 group-hover:text-white/90">
                  <span>/ OPEN UTILITY</span>
                  <Sparkles className="h-3.5 w-3.5 text-white/40" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
