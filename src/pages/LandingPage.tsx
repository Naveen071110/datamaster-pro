import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Hexagon,
  ChevronRight,
  Terminal,
  Database,
  BarChart2,
  GitCompare,
  Code2,
  Workflow,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  X,
  FileCode2,
} from "lucide-react"
import { ScrollVideo } from "@/shared/components/ScrollVideo"

const VIDEO_URL = "/videos/hero-scroll.mp4"

function useRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("translate-y-8", "opacity-0")
            entry.target.classList.add("translate-y-0", "opacity-100")
          }
        })
      },
      { threshold: 0.12 }
    )

    const elements = document.querySelectorAll(".reveal")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useRevealObserver()

  return (
    <div className="relative bg-[#0a0a0a] text-white min-h-screen font-sans selection:bg-white/20 antialiased overflow-x-hidden">
      {/* Smooth Scroll-Scrubbed Video Background (Zero play/pause buttons) */}
      <ScrollVideo videoUrl={VIDEO_URL} />

      {/* Main Content Overlay */}
      <div className="relative z-10">
        {/* Top Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#0a0a0a]/70">
          <div className="px-5 sm:px-8 md:px-12 h-16 sm:h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate("/app")}
            >
              <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                <Hexagon className="h-5 w-5 text-white stroke-[1.75]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight text-white leading-none">
                  DataMaster <span className="text-xs font-mono text-white/50 font-normal">PRO</span>
                </span>
                <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">In-Browser Suite</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => navigate("/sql-sandbox")}
                className="text-xs font-mono tracking-wider uppercase text-white/70 hover:text-white transition-colors duration-200"
              >
                SQL Sandbox
              </button>
              <button
                onClick={() => navigate("/ddl-generator")}
                className="text-xs font-mono tracking-wider uppercase text-white/70 hover:text-white transition-colors duration-200"
              >
                DDL Generator
              </button>
              <button
                onClick={() => navigate("/data-profiler")}
                className="text-xs font-mono tracking-wider uppercase text-white/70 hover:text-white transition-colors duration-200"
              >
                Data Profiler
              </button>
              <button
                onClick={() => navigate("/schema-diff")}
                className="text-xs font-mono tracking-wider uppercase text-white/70 hover:text-white transition-colors duration-200"
              >
                Schema Diff
              </button>
              <button
                onClick={() => navigate("/code-library")}
                className="text-xs font-mono tracking-wider uppercase text-white/70 hover:text-white transition-colors duration-200"
              >
                Snippet Vault
              </button>
            </nav>

            {/* CTA Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app")}
                className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all duration-300 shadow-lg shadow-black/40 flex items-center gap-2"
              >
                <span>Launch Workbench</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/80"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`h-0.5 w-full bg-white transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                  <span className={`h-0.5 w-full bg-white ${mobileMenuOpen ? "opacity-0" : ""}`} />
                  <span className={`h-0.5 w-full bg-white transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden px-5 py-4 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl flex flex-col gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/sql-sandbox") }}
                className="text-left py-2 text-sm text-white/80 hover:text-white flex items-center justify-between"
              >
                <span>SQL WASM Sandbox</span>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/ddl-generator") }}
                className="text-left py-2 text-sm text-white/80 hover:text-white flex items-center justify-between"
              >
                <span>Multi-Dialect DDL</span>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/data-profiler") }}
                className="text-left py-2 text-sm text-white/80 hover:text-white flex items-center justify-between"
              >
                <span>Dataset Profiler</span>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/schema-diff") }}
                className="text-left py-2 text-sm text-white/80 hover:text-white flex items-center justify-between"
              >
                <span>Schema Diff & Migration</span>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/code-library") }}
                className="text-left py-2 text-sm text-white/80 hover:text-white flex items-center justify-between"
              >
                <span>Code Snippet Vault</span>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </button>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-20 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Badge Pill */}
          <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-xl px-4 py-1.5 mb-8">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs text-white/90">100% In-Browser Privacy • SQLite WebAssembly</span>
          </div>

          {/* Main Title */}
          <h1 className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] text-white max-w-4xl">
            The Privacy-First Workbench for{" "}
            <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">
              Data Engineers & Analysts
            </span>
          </h1>

          {/* Subtitle */}
          <p className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out mt-6 text-base sm:text-xl text-white/70 max-w-2xl leading-relaxed">
            Query raw CSVs with full SQL, generate 5-dialect DDLs, profile null percentages, and diff database schemas — completely local in your browser. Zero server uploads.
          </p>

          {/* Action Buttons */}
          <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/app")}
              className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/10 flex items-center gap-2"
            >
              <span>Open Developer App</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-xl px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 flex items-center gap-2.5"
            >
              <Play className="h-4 w-4 fill-white text-white" />
              <span>Watch Video Walkthrough</span>
            </button>
          </div>

          {/* Trust Highlights Grid */}
          <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-mono uppercase tracking-wider">Fast Execution</span>
              </div>
              <span className="text-sm font-semibold text-white">Instant WASM Queries</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider">Zero Storage</span>
              </div>
              <span className="text-sm font-semibold text-white">100% Client Security</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-mono uppercase tracking-wider">Multi-Dialect</span>
              </div>
              <span className="text-sm font-semibold text-white">5 SQL Dialects</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <Code2 className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-mono uppercase tracking-wider">Snippet Vault</span>
              </div>
              <span className="text-sm font-semibold text-white">PySpark, Airflow & dbt</span>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section className="py-20 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out font-mono text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
              Comprehensive Toolkit
            </div>
            <h2 className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out text-3xl sm:text-5xl font-bold tracking-tight text-white">
              7 Essential Utilities in One Dashboard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: SQL WASM */}
            <div
              onClick={() => navigate("/sql-sandbox")}
              className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out md:col-span-2 rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl p-6 sm:p-8 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <Database className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-white/40">01 / SQL WASM</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                In-Browser CSV & SQL WASM Sandbox
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Drag and drop CSV files to instantly parse and run raw SQL queries powered by SQLite WebAssembly in browser memory.
              </p>
              <div className="rounded-xl border border-white/10 bg-[#070707] p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                <div className="text-white/40">// Runs 100% inside your browser memory</div>
                <div>SELECT department, AVG(salary) FROM employees GROUP BY department;</div>
              </div>
            </div>

            {/* Feature 2: DDL Generator */}
            <div
              onClick={() => navigate("/ddl-generator")}
              className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl p-6 sm:p-8 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <Terminal className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-white/40">02 / DDL</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Dialect DDL Synthesizer</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Generate production CREATE TABLE statements for PostgreSQL, Snowflake, BigQuery, MySQL, and SQLite.
              </p>
            </div>

            {/* Feature 3: Data Profiler */}
            <div
              onClick={() => navigate("/data-profiler")}
              className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl p-6 sm:p-8 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-white/40">03 / PROFILER</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dataset Statistics & Quality</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Inspect null percentages, column data types, min/max distributions, and unique value counts instantly.
              </p>
            </div>

            {/* Feature 4: Schema Diff */}
            <div
              onClick={() => navigate("/schema-diff")}
              className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl p-6 sm:p-8 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <GitCompare className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-white/40">04 / DIFF</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Schema Comparison & Migration</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Diff two database schema versions side-by-side and generate ALTER TABLE migration SQL.
              </p>
            </div>

            {/* Feature 5: Code Library */}
            <div
              onClick={() => navigate("/code-library")}
              className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl p-6 sm:p-8 cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-white/40">05 / SNIPPETS</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Code Snippet Vault</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Access verified boilerplate code snippets for PySpark, Apache Airflow, DuckDB, Polars, and dbt.
              </p>
            </div>

            {/* Feature 6: ETL Workflows */}
            <div
              onClick={() => navigate("/etl-workflows")}
              className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out md:col-span-3 rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl p-6 sm:p-8 cursor-pointer group transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-white/40 mb-2">
                  <Workflow className="h-4 w-4 text-purple-400" />
                  <span>06 & 07 / VISUAL PIPELINES & FORMATTER</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Interactive ETL Pipeline DAG Builder & SQL Formatter</h3>
                <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
                  Design complex data pipelines visually with drag-and-drop node connections, format messy SQL queries, and export architectural specs.
                </p>
              </div>

              <button className="rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-white/90 transition-colors shrink-0 flex items-center gap-2">
                <span>Explore Workbench</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Video Demo Modal */}
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-6">
            <div className="relative w-full max-w-4xl rounded-2xl border border-white/20 bg-[#0a0a0a] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">DataMaster Pro — App Walkthrough</span>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Video Frame */}
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={VIDEO_URL}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="px-5 sm:px-8 md:px-12 py-10 border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl text-white/60 text-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Hexagon className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">DataMaster Pro</span>
            <span className="hidden sm:inline">• Privacy-first developer utility suite for data professionals</span>
          </div>

          <div className="flex items-center gap-6 text-white/70 font-mono text-[11px]">
            <button onClick={() => navigate("/app")} className="hover:text-white transition-colors">Dashboard</button>
            <button onClick={() => navigate("/sql-sandbox")} className="hover:text-white transition-colors">SQL WASM</button>
            <button onClick={() => navigate("/ddl-generator")} className="hover:text-white transition-colors">DDL Generator</button>
            <button onClick={() => navigate("/data-profiler")} className="hover:text-white transition-colors">Data Profiler</button>
          </div>
        </footer>
      </div>
    </div>
  )
}
