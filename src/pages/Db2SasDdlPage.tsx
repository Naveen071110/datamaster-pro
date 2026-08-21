import { useState, useMemo } from "react"
import { Database, Copy, Check, Terminal } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

const SAMPLE_DB2_PARAM_QUERY = `SELECT 
  CUST_ID,
  ACCOUNT_NUMBER,
  CUSTOMER_NAME,
  BALANCE_AMOUNT,
  EFFECTIVE_TIMESTAMP
FROM PRODDB.TB_CUSTOMER_MASTER
WHERE DEPT_NO = :dept_no
  AND START_DATE >= '&START_DT'
  AND STATUS = '&STATUS_CODE'
  AND REGION_ID = :region_id;`

const SAMPLE_DB2_PARAM_FILE = `:dept_no = 450
&START_DT = 2024-06-01
&STATUS_CODE = ACTIVE
:region_id = 10`

export default function Db2SasDdlPage() {
  const [db2ParamQuery, setDb2ParamQuery] = useState(SAMPLE_DB2_PARAM_QUERY)
  const [db2ParamFile, setDb2ParamFile] = useState(SAMPLE_DB2_PARAM_FILE)
  const [copiedResolved, setCopiedResolved] = useState(false)

  // Host Variable & Macro Parameter Resolver
  const resolvedParamData = useMemo(() => {
    if (!db2ParamQuery.trim()) {
      return { resolvedSql: "-- Enter a DB2 or SAS query containing :param or &macro variables", detectedParams: {}, uniqueFoundParams: [] }
    }

    const paramMap: Record<string, string> = {}
    const lines = db2ParamFile.split("\n")
    lines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("--")) return

      const match = trimmed.match(/^([:&]?[A-Za-z0-9_]+)\s*[:=]\s*(.+)$/)
      if (match) {
        const rawKey = match[1].trim()
        const rawVal = match[2].trim()
        if (rawKey) {
          const cleanKey = rawKey.replace(/^[:&]/, "")
          paramMap[rawKey] = rawVal
          paramMap[cleanKey] = rawVal
          paramMap[`:${cleanKey}`] = rawVal
          paramMap[`&${cleanKey}`] = rawVal
        }
      }
    })

    // Match :param or &macro without capturing :: typecasts
    const foundParams = Array.from(db2ParamQuery.matchAll(/(?<!:)([:&][A-Za-z0-9_]+)/g)).map((m) => m[1])
    const uniqueFoundParams = Array.from(new Set(foundParams)).sort((a, b) => b.length - a.length)

    let resolvedSql = db2ParamQuery

    uniqueFoundParams.forEach((paramKey) => {
      if (paramMap[paramKey] !== undefined) {
        const val = paramMap[paramKey]
        const escapedKey = paramKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        // Use functional replacer to prevent $1, $& token interpretation
        resolvedSql = resolvedSql.replace(new RegExp(escapedKey, "g"), () => val)
      }
    })

    return { resolvedSql, detectedParams: paramMap, uniqueFoundParams }
  }, [db2ParamQuery, db2ParamFile])

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
          <Database className="h-3.5 w-3.5" />
          <span>IBM DB2 z/OS & SAS Engine</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">IBM DB2 Mainframe & SAS Parameter Resolver</h1>
        <p className="text-white/70 text-sm mt-1 max-w-2xl">
          Substitute DB2 host variables (`:param`) and SAS macro variables (`&macro`) with parameter file values to generate runnable production queries.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Query */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">1. Parameterized DB2 / SAS Query</CardTitle>
            <CardDescription className="text-xs text-white/60">Query with :host_var or &macro_var</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor height="380px" defaultLanguage="sql" theme="vs-dark" value={db2ParamQuery} onChange={(v) => setDb2ParamQuery(v || "")} />
            </div>
          </CardContent>
        </Card>

        {/* Parameter File */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-sky-400">2. Parameter / Host Variable File</CardTitle>
            <CardDescription className="text-xs text-white/60">Key = Value parameter mapping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor height="290px" defaultLanguage="plaintext" theme="vs-dark" value={db2ParamFile} onChange={(v) => setDb2ParamFile(v || "")} />
            </div>

            {resolvedParamData.uniqueFoundParams && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-white/50 uppercase">Detected Host Variables:</span>
                <div className="flex flex-wrap gap-1.5">
                  {resolvedParamData.uniqueFoundParams.map((p) => (
                    <Badge key={p} variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-300 text-[10px] font-mono">
                      {p} = {resolvedParamData.detectedParams[p] || "MISSING"}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Substituted Query */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-emerald-400">3. Runnable Substituted Query</CardTitle>
              <CardDescription className="text-xs text-white/60">Ready to execute in DB2 / SAS</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const blob = new Blob([resolvedParamData.resolvedSql], { type: "application/sql" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "db2_sas_resolved_query.sql"
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs"
              >
                <Database className="h-3.5 w-3.5 mr-1" />
                <span>Download .sql</span>
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(resolvedParamData.resolvedSql).catch(() => {})
                  setCopiedResolved(true)
                  setTimeout(() => setCopiedResolved(false), 2000)
                }}
                className="bg-white text-black hover:bg-white/90 text-xs"
              >
                {copiedResolved ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1">{copiedResolved ? "Copied!" : "Copy SQL"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor height="380px" defaultLanguage="sql" theme="vs-dark" value={resolvedParamData.resolvedSql} options={{ readOnly: true }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
