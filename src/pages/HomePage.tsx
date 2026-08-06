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
    <div className="p-4 sm:p-6 space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8 space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            100% In-Browser & Privacy-First
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Zero Server Uploads
          </Badge>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            DataMaster Pro
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            The free, open-source micro-utility suite for Data Engineers & Data Analysts. Parse CSVs, generate multi-dialect DDL, profile datasets, diff schemas, and beautify SQL — entirely in your browser.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button size="lg" onClick={() => navigate("/sql-sandbox")} className="gap-2">
            <Terminal className="h-5 w-5" />
            Launch CSV SQL Sandbox
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/ddl-generator")} className="gap-2">
            <FileCode className="h-5 w-5" />
            CSV to DDL Generator
          </Button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Data Engineering Utility Suite</h2>
          <span className="text-xs text-muted-foreground">7 Micro-SaaS Tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {microSaasTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.path}
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all border-border/60 flex flex-col justify-between"
                onClick={() => navigate(tool.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2.5 rounded-lg border ${tool.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
