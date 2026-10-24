import { useNavigate, useSearchParams } from "react-router-dom"
import {
  CheckCircle2,
  Terminal,
  FileCode,
  Snowflake,
  Home,
  ChevronRight,
  ShieldCheck,
  MailCheck,
} from "lucide-react"
import { SEO } from "@/shared/components/SEO"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

export default function ThankYouPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inquiryType = searchParams.get("type") || "contact"

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto text-center animate-in fade-in duration-300">
      <SEO
        title="Thank You | DataMaster Pro"
        description="Thank you for reaching out to the DataMaster Pro team. We have received your inquiry and will follow up shortly."
      />

      {/* Success Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
        <MailCheck className="h-4 w-4" />
        <span className="font-mono text-xs uppercase tracking-wider font-semibold">Message Dispatched Successfully</span>
      </div>

      {/* Main Check Icon */}
      <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400 shadow-xl shadow-emerald-500/5">
        <CheckCircle2 className="h-9 w-9 stroke-[2.25]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
        Thank You for Reaching Out!
      </h1>

      <p className="text-white/70 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        {inquiryType === "feedback"
          ? "Your feedback and feature suggestions help us refine our privacy-first data engineering tools."
          : "We have received your message. The developer team will review your inquiry and get back to you within 24 to 48 hours."}
      </p>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <button
          onClick={() => navigate("/app")}
          className="px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-white/10 flex items-center gap-2"
        >
          <Terminal className="h-4 w-4" />
          <span>Open Developer Workbench</span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      {/* Quick Explore Panel */}
      <div className="w-full text-left bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
              NEXT STEPS
            </Badge>
            <span className="text-xs text-white/80 font-semibold">Try These In-Browser Tools Right Now</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>Zero Server Uploads</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card
            onClick={() => navigate("/sql-sandbox")}
            className="bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer transition-all duration-200"
          >
            <CardContent className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <Terminal className="h-4 w-4 text-blue-400" />
                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              </div>
              <div className="text-xs font-semibold text-white">SQL WASM Sandbox</div>
              <p className="text-[11px] text-white/50 line-clamp-2">Query raw CSV datasets instantly in local memory.</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate("/ddl-generator")}
            className="bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer transition-all duration-200"
          >
            <CardContent className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <FileCode className="h-4 w-4 text-emerald-400" />
                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              </div>
              <div className="text-xs font-semibold text-white">DDL Generator</div>
              <p className="text-[11px] text-white/50 line-clamp-2">Generate schemas across Snowflake, Postgres & BigQuery.</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate("/snowflake-stage-generator")}
            className="bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer transition-all duration-200"
          >
            <CardContent className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <Snowflake className="h-4 w-4 text-sky-400" />
                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              </div>
              <div className="text-xs font-semibold text-white">Snowflake Stage</div>
              <p className="text-[11px] text-white/50 line-clamp-2">Synthesize AWS S3, Azure Blob, and GCS COPY commands.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
