import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Hexagon, ChevronRight, Terminal } from "lucide-react"
import { ScrollVideo } from "@/shared/components/ScrollVideo"

const VIDEO_URL = "/videos/hero-scroll.mp4"
const POSTER_URL = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260728_050334_5b076e26-0ce7-4898-b432-d764190e448f.png&w=1280&q=85"

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
      { threshold: 0.15 }
    )

    const elements = document.querySelectorAll(".reveal")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

export default function LandingPage() {
  const navigate = useNavigate()
  useRevealObserver()

  return (
    <div className="relative bg-[#0a0a0a] text-white min-h-screen font-sans selection:bg-white/20 antialiased overflow-x-hidden">
      {/* Scroll-scrubbed background video */}
      <ScrollVideo videoUrl={VIDEO_URL} posterUrl={POSTER_URL} />

      {/* Main Content Overlay */}
      <div className="relative z-10">
        {/* Fixed Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/15 backdrop-blur-md bg-[#0a0a0a]/30">
          <div className="px-5 sm:px-8 md:px-12 h-16 sm:h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/app")}>
              <Hexagon className="h-6 w-6 stroke-[1.5] text-white" />
              <span className="text-lg sm:text-xl font-medium tracking-tight">datamaster</span>
            </div>

            {/* Nav Links (md+) */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-10">
              <button onClick={() => navigate("/sql-sandbox")} className="text-sm text-white/85 hover:text-white transition-colors duration-300 flex items-baseline gap-1">
                <span>Utilities</span>
                <span className="font-mono text-[10px] text-white/60">7</span>
              </button>
              <button onClick={() => navigate("/ddl-generator")} className="text-sm text-white/85 hover:text-white transition-colors duration-300">
                DDL Generator
              </button>
              <button onClick={() => navigate("/data-profiler")} className="text-sm text-white/85 hover:text-white transition-colors duration-300">
                Data Profiler
              </button>
              <button onClick={() => navigate("/code-library")} className="text-sm text-white/85 hover:text-white transition-colors duration-300">
                Snippet Vault
              </button>
            </nav>

            {/* CTA */}
            <button
              onClick={() => navigate("/app")}
              className="rounded-md border border-white/20 bg-white/15 backdrop-blur-md px-4 py-2 text-xs sm:px-5 sm:text-sm font-medium text-white hover:bg-white/25 transition-all duration-300"
            >
              Launch Utility Suite
            </button>
          </div>
        </header>

        {/* Section One — Hero */}
        <section className="min-h-screen supports-[height:100svh]:min-h-[100svh] px-5 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-12 md:pb-16 flex flex-col justify-between">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
            {/* Left Services */}
            <div className="space-y-2">
              <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md" style={{ transitionDelay: "150ms" }}>
                / IN-BROWSER SQL WASM
              </div>
              <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md" style={{ transitionDelay: "270ms" }}>
                / MULTI-DIALECT DDL
              </div>
              <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md" style={{ transitionDelay: "390ms" }}>
                / DATA QUALITY PROFILER
              </div>
            </div>

            {/* Right Intro */}
            <p className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out max-w-xs sm:text-right text-lg sm:text-xl leading-relaxed text-white drop-shadow-md" style={{ transitionDelay: "300ms" }}>
              We design automation that brings clarity, precision, and efficiency to the way your company operates.
            </p>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mt-16 sm:mt-0">
            {/* Left Headlines */}
            <div className="max-w-xl">
              <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out inline-flex items-center border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md mb-5" style={{ transitionDelay: "150ms" }}>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
                  We Automate 100+ Businesses
                </span>
              </div>

              <h1 className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg" style={{ transitionDelay: "280ms" }}>
                Clear. Precise.
                <br />
                Automated.
              </h1>
            </div>

            {/* Right Glass Launch Card */}
            <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out flex items-center gap-4 rounded-xl bg-white/15 p-4 backdrop-blur-md border border-white/15 w-full sm:w-auto" style={{ transitionDelay: "420ms" }}>
              <div className="h-12 w-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col gap-1 pr-2">
                <span className="text-sm font-medium text-white">Interactive Workbench</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                  100% Client-Side WASM
                </span>
                <button
                  onClick={() => navigate("/sql-sandbox")}
                  className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-black hover:bg-white/85 transition-colors duration-300"
                >
                  <span>Launch SQL Sandbox</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mid Spacer for Scroll Video Scrub Length */}
        <div className="h-[80vh]" aria-hidden="true" />

        {/* Section Two — Capability */}
        <section className="min-h-screen supports-[height:100svh]:min-h-[100svh] px-5 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-12 md:pb-16 flex flex-col justify-between">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
            <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out inline-flex items-center border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md" style={{ transitionDelay: "120ms" }}>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
                Insight On Demand
              </span>
            </div>

            <p className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out max-w-sm sm:text-right text-lg sm:text-xl leading-relaxed text-white drop-shadow-md" style={{ transitionDelay: "220ms" }}>
              Our AI doesn't just respond — it interprets, sharpens, and delivers the signal you need.
            </p>
          </div>

          {/* Bottom Area */}
          <div className="flex-1 flex flex-col md:flex-row items-end justify-between gap-12 lg:gap-16 mt-16 sm:mt-0">
            {/* Left Column */}
            <div className="max-w-xl">
              <h2 className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg" style={{ transitionDelay: "180ms" }}>
                Learn to see
                <br />
                brilliantly.
              </h2>

              <p className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out mt-6 max-w-md text-sm sm:text-base text-white/80 drop-shadow-md leading-relaxed" style={{ transitionDelay: "320ms" }}>
                From the first sketch to the final render, DataMaster turns raw intent into decisions your team can act on — quietly, precisely, at speed.
              </p>

              <div className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out mt-8 flex flex-wrap gap-3" style={{ transitionDelay: "420ms" }}>
                <button
                  onClick={() => navigate("/sql-sandbox")}
                  className="rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-medium text-black hover:bg-white/85 transition-colors duration-300 inline-flex items-center gap-1.5"
                >
                  <span>Launch SQL Sandbox</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => navigate("/app")}
                  className="rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-5 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-colors duration-300"
                >
                  Open Developer Dashboard
                </button>
              </div>
            </div>

            {/* Right — Frosted Capability Panel */}
            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-5 sm:px-6 divide-y divide-white/15">
              {[
                {
                  id: "01",
                  title: "In-Browser WebAssembly Engine",
                  body: "Executes SQL queries directly inside your browser memory using SQLite compiled to WebAssembly.",
                  delay: "300ms",
                },
                {
                  id: "02",
                  title: "Multi-Dialect DDL Synthesis",
                  body: "Translates raw CSV structures into optimized PostgreSQL, Snowflake, BigQuery, MySQL, and SQLite DDL.",
                  delay: "410ms",
                },
                {
                  id: "03",
                  title: "100% Zero-Server Privacy",
                  body: "Your enterprise records, CSV files, and database schemas never leave your device.",
                  delay: "520ms",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="reveal translate-y-8 opacity-0 transition-all duration-700 ease-out flex gap-5 py-5 group"
                  style={{ transitionDelay: item.delay }}
                >
                  <span className="font-mono text-[11px] tracking-[0.15em] text-white/55 pt-0.5">
                    {item.id}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-medium text-white">
                        {item.title}
                      </h3>
                      <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="px-5 sm:px-8 md:px-12 py-8 border-t border-white/15 bg-[#0a0a0a]/80 backdrop-blur-md text-white/60 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hexagon className="h-5 w-5 text-white" />
            <span className="font-medium text-white">datamaster</span>
            <span>— Today Data Engine Aligns With Bold Pipelines</span>
          </div>

          <div className="flex items-center gap-6 text-white/80">
            <button onClick={() => navigate("/app")} className="hover:text-white transition-colors">Dashboard</button>
            <button onClick={() => navigate("/sql-sandbox")} className="hover:text-white transition-colors">SQL WASM</button>
            <button onClick={() => navigate("/ddl-generator")} className="hover:text-white transition-colors">DDL Generator</button>
          </div>
        </footer>
      </div>
    </div>
  )
}
