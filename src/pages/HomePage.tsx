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
  Zap,
  Lock,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

const microSaasTools = [
  {
    path: "/sql-sandbox",
    icon: Terminal,
    title: "1. CSV & SQL Sandbox",
    description: "Upload custom CSVs or query mock datasets in-browser using SQLite WASM with export to CSV/JSON.",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    badge: "Interactive WASM Engine"
  },
  {
    path: "/ddl-generator",
    icon: FileCode,
    title: "2. CSV to Multi-Dialect DDL Generator",
    description: "Convert raw CSVs or JSON payloads into CREATE TABLE & INSERT statements for Postgres, Snowflake, BigQuery, MySQL, SQLite.",
    color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    badge: "5 Dialects Supported"
  },
  {
    path: "/data-profiler",
    icon: BarChart3,
    title: "3. Data Profiler & Quality Inspector",
    description: "Instant statistical health check: NULL rates, unique counts, numeric distributions, and data anomaly warnings.",
    color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    badge: "Automated Diagnostics"
  },
  {
    path: "/schema-diff",
    icon: GitCompare,
    title: "4. Schema Diff & Drift Inspector",
    description: "Compare two database schemas side-by-side to highlight added/deleted columns and generate ALTER TABLE scripts.",
    color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    badge: "Auto Migration SQL"
  },
  {
    path: "/sql-formatter",
    icon: AlignLeft,
    title: "5. SQL Formatter & Beautifier",
    description: "Standardize raw queries, align clauses, and format keyword casing for clean, readable production SQL.",
    color: "text-pink-400 border-pink-500/20 bg-pink-500/5",
    badge: "Syntax Beautifier"
  },
  {
    path: "/code-library",
    icon: BookOpen,
    title: "6. Snippet Vault",
    description: "50+ production-tested code snippets for SQL Window Functions, CTEs, Python ETL, PySpark, and Airflow.",
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    badge: "50+ Snippets"
  },
  {
    path: "/etl-workflows",
    icon: GitBranch,
    title: "7. ETL Architecture Builder",
    description: "Visual ReactFlow DAG diagram canvas to design, document, and visualize data pipeline architectures.",
    color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    badge: "Visual DAG Canvas"
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-6xl mx-auto text-white">
      {/* Hero Banner */}
      <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 sm:p-8 space-y-4 overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-3 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
            100% In-Browser & Privacy-First
          </Badge>
          <Badge variant="outline" className="text-xs border-white/20 text-white/80 bg-white/5">
            <Lock className="h-3 w-3 mr-1 text-white/60" />
            Zero Server Uploads
          </Badge>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md">
            DataMaster Pro Dashboard
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed drop-shadow">
            The privacy-first developer utility suite for Data Engineers & Data Analysts. Select any tool below to process CSVs, generate multi-dialect DDL, profile datasets, or format SQL.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => navigate("/sql-sandbox")}
            className="rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-medium text-black hover:bg-white/85 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <Terminal className="h-4 w-4" />
            <span>Launch CSV SQL Sandbox</span>
          </button>
          <button
            onClick={() => navigate("/ddl-generator")}
            className="rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-5 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <FileCode className="h-4 w-4" />
            <span>CSV to DDL Generator</span>
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white">Developer Utility Suite</h2>
          <span className="font-mono text-xs text-white/50 uppercase tracking-[0.15em]">7 Micro-SaaS Tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {microSaasTools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.path}
                className="cursor-pointer hover:border-white/40 hover:bg-white/15 transition-all duration-300 border border-white/15 bg-white/10 backdrop-blur-md rounded-xl p-5 flex flex-col justify-between group"
                onClick={() => navigate(tool.path)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg border border-white/20 bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-white/70">
                      {tool.badge}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">{tool.title}</h3>
                  <p className="text-xs leading-relaxed text-white/75 mt-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
