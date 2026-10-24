import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Compass,
  Home,
  Terminal,
  FileCode,
  BarChart3,
  Snowflake,
  Layers,
  ArrowLeft,
  Search,
  ChevronRight,
  LifeBuoy,
} from "lucide-react"
import { SEO } from "@/shared/components/SEO"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

const POPULAR_TOOLS = [
  {
    name: "CSV & SQL WASM Sandbox",
    path: "/sql-sandbox",
    desc: "Execute ANSI SQL in-browser with zero uploads",
    icon: Terminal,
    color: "text-blue-400",
  },
  {
    name: "Multi-Dialect DDL Generator",
    path: "/ddl-generator",
    desc: "Generate Snowflake, Postgres, and BigQuery schemas",
    icon: FileCode,
    color: "text-emerald-400",
  },
  {
    name: "Automated Data Profiler",
    path: "/data-profiler",
    desc: "Analyze null percentages, cardinality, and quality",
    icon: BarChart3,
    color: "text-purple-400",
  },
  {
    name: "Snowflake Stage & COPY",
    path: "/snowflake-stage-generator",
    desc: "Generate storage integration & stage scripts",
    icon: Snowflake,
    color: "text-sky-400",
  },
  {
    name: "dbt Model Synthesizer",
    path: "/dbt-model-generator",
    desc: "Build schema.yml and staging SQL models",
    icon: Layers,
    color: "text-amber-400",
  },
]

export default function NotFoundPage() {
  const navigate = useNavigate()
  const [filterQuery, setFilterQuery] = useState("")

  const filteredTools = POPULAR_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto text-center animate-in fade-in duration-300">
      <SEO
        title="Page Not Found (404) | DataMaster Pro"
        description="The requested data engineering tool or page could not be found. Explore our 19 client-side WebAssembly utilities or return to the workbench."
      />

      {/* 404 Glowing Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
        <Compass className="h-4 w-4 animate-spin-slow" />
        <span className="font-mono text-xs uppercase tracking-wider font-semibold">Error 404 • Route Not Found</span>
      </div>

      {/* Big Display Code */}
      <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white/90 font-mono mb-4">
        4<span className="text-blue-500">0</span>4
      </h1>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
        Lost in the Data Pipeline?
      </h2>

      <p className="text-white/60 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        The route you are trying to query doesn't exist or has been shifted in schema. Return to safety or launch one of our 19 in-browser developer utilities below.
      </p>

      {/* Main Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>

        <button
          onClick={() => navigate("/app")}
          className="px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-white/10 flex items-center gap-2"
        >
          <Terminal className="h-4 w-4" />
          <span>Launch Workbench</span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span>Landing Page</span>
        </button>
      </div>

      {/* Quick Search & Popular Utilities */}
      <div className="w-full max-w-xl text-left bg-[#111111]/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] font-mono">
              SUGGESTIONS
            </Badge>
            <span className="text-xs text-white/70 font-semibold">Popular In-Browser Tools</span>
          </div>

          <div className="relative w-44">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter tools..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <Card
                key={tool.path}
                onClick={() => navigate(tool.path)}
                className="bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer transition-all duration-200"
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <tool.icon className={`h-4 w-4 ${tool.color}`} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white tracking-tight">{tool.name}</div>
                      <div className="text-[11px] text-white/50">{tool.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-white/40">
              No matching tools found. <button onClick={() => navigate("/app")} className="text-blue-400 underline ml-1">Browse all 19 tools</button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
          <span>Need custom data tooling assistance?</span>
          <button
            onClick={() => navigate("/contact")}
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-mono"
          >
            <LifeBuoy className="h-3 w-3" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  )
}
