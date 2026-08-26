import { Scale, CheckCircle2, AlertTriangle, Code2 } from "lucide-react"
import { SEO } from "@/shared/components/SEO"
import { Card, CardContent } from "@/shared/components/ui/card"

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <SEO />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Scale className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Terms of Service</h1>
            <p className="text-xs text-white/50 font-mono mt-0.5">Effective Date: August 2026 • Last Updated: August 2026</p>
          </div>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          Welcome to DataMaster Pro. By accessing or using our website, utilities, and developer tools, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Code2 className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">MIT License</span>
            </div>
            <p className="text-xs text-white/60">
              DataMaster Pro is open-source software distributed under the permissive MIT License.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">Free to Use</span>
            </div>
            <p className="text-xs text-white/60">
              All 19 developer utilities are provided free of charge for personal and commercial data engineering workflows.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">No Warranty</span>
            </div>
            <p className="text-xs text-white/60">
              Provided &quot;as is&quot; without warranty of any kind. Always test generated SQL/DDL before running in production.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Terms */}
      <div className="space-y-6 text-sm text-white/80 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">1. License & Intellectual Property</h2>
          <p>
            DataMaster Pro is released under the <strong>MIT License</strong>. You are granted permission to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions of the MIT License.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">2. Acceptable Use</h2>
          <p>
            You agree to use DataMaster Pro only for lawful purposes. You agree not to attempt to disrupt the static hosting infrastructure, execute denial-of-service attacks, or abuse the application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">3. Generated Code & Production Disclaimer</h2>
          <p>
            DataMaster Pro generates SQL scripts, DDL schemas, dbt models, Airflow Python DAGs, and transpiled expressions for multiple dialects (PostgreSQL, Snowflake, BigQuery, MySQL, SQLite, DB2). While we strive for 100% syntactical accuracy:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-white/70">
            <li>Generated code is provided for reference and utility acceleration.</li>
            <li>You are solely responsible for reviewing and testing all SQL queries, DDL migrations, and Airflow DAGs prior to executing them against production databases or data warehouses.</li>
            <li>The authors and contributors shall not be liable for any data loss, schema corruption, or cloud infrastructure compute costs incurred from running generated code.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">4. Limitation of Liability</h2>
          <p className="text-xs uppercase text-white/60">
            IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be posted to this page with an updated effective date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-white">6. Contact</h2>
          <p>
            For questions regarding these Terms, please reach out via <a href="https://naveenguru.vercel.app" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-white/80">Naveen&apos;s Portfolio</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
