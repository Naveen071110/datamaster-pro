import { Shield, Lock, HardDrive, Cookie } from "lucide-react"
import { SEO } from "@/shared/components/SEO"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <SEO />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
            <p className="text-xs text-white/50 font-mono mt-0.5">Effective Date: August 2026 • Last Updated: August 2026</p>
          </div>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          DataMaster Pro is committed to protecting your privacy. Unlike traditional cloud-based developer tools, our utility suite operates on a strict <strong className="text-white">100% In-Browser Client-Side Processing Architecture</strong>. We do not transmit, collect, or store your private data, SQL queries, CSV datasets, or database schema definitions on any external server.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <HardDrive className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">Zero Uploads</span>
            </div>
            <p className="text-xs text-white/60">
              Your CSVs, SQL queries, dbt models, and schemas are processed locally in WebAssembly memory and never touch remote servers.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Lock className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">No Tracking</span>
            </div>
            <p className="text-xs text-white/60">
              We do not sell personal data, inject third-party ad pixels, or profile your developer activity across the internet.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Cookie className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">GDPR Consent</span>
            </div>
            <p className="text-xs text-white/60">
              Granular cookie controls allow you to accept, customize, or revoke functional and analytics cookie preferences at any time.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6 text-sm text-white/80 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>1. Information We Do NOT Collect</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Zero Data Retention</Badge>
          </h2>
          <p>
            When utilizing any of our 19 developer tools (such as the CSV & SQL Sandbox, DDL Generator, Snowflake Stage Synthesizer, or dbt Model Builder), your input files and queries are parsed and executed in pure browser memory via JavaScript and SQLite WebAssembly (<code className="text-xs bg-white/10 px-1 py-0.5 rounded font-mono">sql.js</code>).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-white/70">
            <li>We do not transmit your uploaded CSV files or test datasets to any backend.</li>
            <li>We do not record, log, or inspect SQL queries or synthesized execution plans.</li>
            <li>We do not store cloud credentials or database passwords.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Local Storage & Client State</h2>
          <p>
            For your convenience, DataMaster Pro stores your UI preferences (such as dark/light theme, collapsed sidebar state, and saved code bookmarks) in your browser&apos;s <code className="text-xs bg-white/10 px-1 py-0.5 rounded font-mono">localStorage</code> and first-party cookies. This data remains on your physical device and can be cleared at any time through your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Cookies and Consent Management</h2>
          <p>
            In compliance with GDPR and the EU ePrivacy Directive, DataMaster Pro implements a centralized, strongly-typed cookie manager:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <strong className="text-white block mb-1">Strictly Necessary Cookies</strong>
              Session security, CSRF protection, and consent record state. These are always active and do not track users.
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <strong className="text-white block mb-1">Functional Cookies</strong>
              Stores your theme and workspace preferences. Only activated with your consent.
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <strong className="text-white block mb-1">Analytics & Marketing Cookies</strong>
              Opt-in only. Used strictly for anonymous, aggregated first-party feature adoption metrics.
            </div>
          </div>
          <p className="text-xs text-white/60">
            You can modify your cookie preferences at any time by clicking the <strong className="text-white cursor-pointer underline" onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('datamaster:open-cookie-modal')) }}>Cookie Settings</strong> link in the footer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Third-Party Services</h2>
          <p>
            DataMaster Pro is hosted as a static web application on Render. Static asset requests (HTML, JS, CSS, WASM) are subject to standard HTTP server access logs (IP address, user agent) as maintained by cloud hosting providers for DDoS mitigation and infrastructure security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Contact & Inquiries</h2>
          <p>
            If you have questions about this Privacy Policy or our security model, please contact the developer via <a href="https://naveenguru.vercel.app" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-white/80">Naveen&apos;s Portfolio</a> or file an issue on <a href="https://github.com/Naveen071110/datamaster-pro" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-white/80">GitHub</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
