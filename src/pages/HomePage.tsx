import { useNavigate } from "react-router-dom"
import {
  Terminal,
  FileCode,
  BarChart3,
  GitCompare,
  AlignLeft,
  BookOpen,
  GitBranch,
  Gauge,
  ShieldCheck,
  HelpCircle,
  Wrench,
  ChevronRight,
  Sparkles,
  Code2,
  Database,
  FileCode2,
  DollarSign,
  Cloud,
  Layers,
  Workflow,
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
    path: "/test-data-generator",
    icon: Sparkles,
    title: "04. Synthetic Mock Data Generator",
    description: "Generate high-speed, realistic relational test datasets (Users, Orders, Companies, Ledgers, Logs) with CSV, JSON & SQL exports.",
    badge: "Faker & Mock Engine"
  },
  {
    path: "/currency-converter",
    icon: DollarSign,
    title: "05. Live FX Rates & Currency Normalizer",
    description: "Live foreign exchange rates across 30+ global currencies. Real-time conversion & SQL `dim_exchange_rates` DDL generation.",
    badge: "Live ECB Market Feed"
  },
  {
    path: "/schema-diff",
    icon: GitCompare,
    title: "06. Schema Diff & Drift Inspector",
    description: "Side-by-side DDL schema comparator highlighting added (+), deleted (-), and modified (~) columns with ALTER TABLE SQL.",
    badge: "Auto Migration SQL"
  },
  {
    path: "/sql-formatter",
    icon: AlignLeft,
    title: "07. SQL Formatter & Beautifier",
    description: "Standardize raw queries, align clauses, and format keyword casing for clean, readable production SQL.",
    badge: "Syntax Beautifier"
  },
  {
    path: "/code-library",
    icon: BookOpen,
    title: "08. Snippet Vault",
    description: "50+ production-tested code snippets for SQL Window Functions, CTEs, Python ETL, PySpark, and Airflow.",
    badge: "50+ Snippets"
  },
  {
    path: "/etl-workflows",
    icon: GitBranch,
    title: "09. ETL Architecture DAG Builder",
    description: "Visual ReactFlow canvas to design, document, and visualize complex data pipeline workflow DAG architectures.",
    badge: "Visual DAG Canvas"
  },
]

const etlCloudTools = [
  {
    path: "/snowflake-stage-generator",
    icon: Cloud,
    title: "10. Snowflake Stage & COPY Synthesizer",
    description: "Synthesize Snowflake External/Internal Stages, File Formats, COPY INTO statements, Snowpipes, and compute cost estimates.",
    badge: "Snowflake Modern Lakehouse"
  },
  {
    path: "/dbt-model-generator",
    icon: Layers,
    title: "11. dbt Model & YAML Schema Synthesizer",
    description: "Convert raw SQL queries into enterprise dbt SQL models with `source()`, `ref()`, and automated `schema.yml` tests and docs.",
    badge: "dbt (data build tool)"
  },
  {
    path: "/airflow-dag-generator",
    icon: Workflow,
    title: "12. Apache Airflow Python DAG Generator",
    description: "Generate production Airflow 2.x Python DAGs with operator task chains (`>>`), retry policies, and interactive cron validation.",
    badge: "Airflow Workflow Engine"
  },
  {
    path: "/informatica-mapping-to-sql",
    icon: FileCode2,
    title: "13. Informatica XML Mapping to SQL Converter",
    description: "Convert Informatica PowerCenter mapping XML files into precise, executable SQL CTE queries and bind `.par` parameter files.",
    badge: "PowerCenter & IICS"
  },
  {
    path: "/informatica-expression-transpiler",
    icon: Code2,
    title: "14. Informatica Expression Transpiler",
    description: "Validate and convert complex Informatica transformation functions (IIF, DECODE, ISNULL, ADD_TO_DATE) into database SQL.",
    badge: "Expression Validator"
  },
]

const diagnosticsTools = [
  {
    path: "/performance-analyzer",
    icon: Gauge,
    title: "15. Query Performance Analyzer",
    description: "Analyze SQL execution plans, spot full table scans or Cartesian joins, and get actionable performance hints.",
    badge: "Execution Plan Hints"
  },
  {
    path: "/schema-validator",
    icon: ShieldCheck,
    title: "16. Schema Validator & Linter",
    description: "Audit DDL schemas for anti-patterns, missing primary keys, unindexed foreign keys, and bad naming conventions.",
    badge: "Schema Linter"
  },
  {
    path: "/qa",
    icon: HelpCircle,
    title: "17. Data QA Checks & Assertions",
    description: "Run automated data quality tests, validate column nullability, unique key constraints, and numeric ranges.",
    badge: "Data Assertion Suite"
  },
  {
    path: "/troubleshooting",
    icon: Wrench,
    title: "18. Pipeline & SQL Debugger",
    description: "Troubleshoot common data engineering errors, SQL execution failures, WASM memory issues, and pipeline bottlenecks.",
    badge: "Interactive Debugger"
  },
  {
    path: "/db2-sas-ddl-generator",
    icon: Database,
    title: "19. DB2 & SAS Parameter Resolver",
    description: "Substitute DB2 host variables (:dept_no) and SAS macro variables (&START_DT) with parameter file values into runnable queries.",
    badge: "Host Variable Resolver"
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
              Developer Workbench • 19 Active Tools
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
            Snowflake. dbt. Airflow.
            <br />
            ETL & Data Engineering Suite.
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed drop-shadow max-w-2xl">
            Welcome to DataMaster Pro. A unified developer workbench for modern data teams covering Snowflake, dbt, Apache Airflow, Informatica, and Diagnostics & QA.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => navigate("/snowflake-stage-generator")}
            className="rounded-full bg-white px-6 py-3 text-xs sm:text-sm font-medium text-black hover:bg-white/85 transition-colors duration-300 inline-flex items-center gap-2 shadow-lg"
          >
            <Cloud className="h-4 w-4" />
            <span>Snowflake & Cloud Tools</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/dbt-model-generator")}
            className="rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-6 py-3 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-colors duration-300 inline-flex items-center gap-2"
          >
            <Layers className="h-4 w-4 text-orange-400" />
            <span>dbt Model Synthesizer</span>
          </button>
        </div>
      </div>

      {/* Section 1: Micro-SaaS Utilities (9 Tools) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
            Micro-SaaS Utilities
          </h2>
          <span className="font-mono text-xs text-white/50 uppercase tracking-[0.15em]">
            9 Core Tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {microSaasTools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.path}
                role="link"
                tabIndex={0}
                aria-label={`Open ${tool.title}`}
                onClick={() => navigate(tool.path)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(tool.path); } }}
                className="cursor-pointer group rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-white"
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

      {/* Section 2: ETL & Cloud Data Suite (5 Tools: Snowflake, dbt, Airflow, Informatica) */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-4">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-sky-400 flex items-center gap-2">
            <span>ETL & Cloud Data Suite</span>
          </h2>
          <span className="font-mono text-xs text-sky-400/60 uppercase tracking-[0.15em]">
            5 Modern ETL & Pipeline Tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {etlCloudTools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.path}
                role="link"
                tabIndex={0}
                aria-label={`Open ${tool.title}`}
                onClick={() => navigate(tool.path)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(tool.path); } }}
                className="cursor-pointer group rounded-xl border border-sky-500/20 bg-sky-950/10 backdrop-blur-md p-6 hover:bg-sky-950/20 hover:border-sky-500/40 transition-all duration-300 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-sky-400/80 border border-sky-500/20 px-2.5 py-1 rounded bg-sky-500/5">
                      {tool.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-sky-300 transition-colors">
                      {tool.title}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-sky-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>

                  <p className="text-xs leading-relaxed text-white/70 mt-2.5">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-sky-400/60 group-hover:text-sky-300">
                  <span>/ OPEN PIPELINE TOOL</span>
                  <Sparkles className="h-3.5 w-3.5 text-sky-400/50" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 3: Diagnostics & QA Suite (5 Tools) */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-emerald-400 flex items-center gap-2">
            <span>Diagnostics & QA Suite</span>
          </h2>
          <span className="font-mono text-xs text-emerald-400/60 uppercase tracking-[0.15em]">
            5 Quality & Diagnostic Tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {diagnosticsTools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.path}
                role="link"
                tabIndex={0}
                aria-label={`Open ${tool.title}`}
                onClick={() => navigate(tool.path)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(tool.path); } }}
                className="cursor-pointer group rounded-xl border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-md p-6 hover:bg-emerald-950/20 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/80 border border-emerald-500/20 px-2.5 py-1 rounded bg-emerald-500/5">
                      {tool.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-emerald-300 transition-colors">
                      {tool.title}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>

                  <p className="text-xs leading-relaxed text-white/70 mt-2.5">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400/60 group-hover:text-emerald-300">
                  <span>/ OPEN DIAGNOSTIC TOOL</span>
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400/50" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
