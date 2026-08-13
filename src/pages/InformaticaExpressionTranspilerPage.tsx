import { useState, useMemo } from "react"
import { Code2, Copy, Check, Terminal, Sparkles, AlertCircle, HelpCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

const SAMPLE_EXPRESSION = `IIF(ISNULL(SALES_AMT), 0, SALES_AMT) + 
IIF(REGION_CODE = 'US' AND DEPT_ID != 99, 
    DECODE(PRODUCT_CATEGORY, 
        'ELECTRONICS', SALES_AMT * 0.15, 
        'FURNITURE', SALES_AMT * 0.10, 
        SALES_AMT * 0.05), 
    0)`

const EXAMPLES = [
  {
    label: "Nested IIF & DECODE",
    expr: `IIF(ISNULL(SALES_AMT), 0, SALES_AMT) + \nIIF(REGION_CODE = 'US', DECODE(PROD_CAT, 'ELEC', SALES_AMT * 0.15, 'FURN', SALES_AMT * 0.10, 0), 0)`,
  },
  {
    label: "Date & String Functions",
    expr: `TO_CHAR(ADD_TO_DATE(HIRE_DATE, 'DD', 30), 'YYYY-MM-DD') || ' - ' || UPPER(SUBSTR(EMP_NAME, 1, 10))`,
  },
  {
    label: "Complex Null & Regex",
    expr: `IIF(NOT ISNULL(EMAIL) AND REGEXP_INSTR(EMAIL, '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$') > 0, UPPER(EMAIL), 'INVALID_EMAIL')`,
  },
]

type TargetDialect = "snowflake" | "postgres" | "db2" | "oracle" | "bigquery"

export default function InformaticaExpressionTranspilerPage() {
  const [exprInput, setExprInput] = useState(SAMPLE_EXPRESSION)
  const [dialect, setDialect] = useState<TargetDialect>("db2")
  const [copied, setCopied] = useState(false)

  // Transpile Informatica PowerCenter Expression to Target SQL
  const transpiledOutput = useMemo(() => {
    if (!exprInput.trim()) return ""

    let sql = exprInput

    // IIF(ISNULL(x), a, b) -> COALESCE(x, a)
    sql = sql.replace(/IIF\s*\(\s*ISNULL\((.*?)\)\s*,\s*(.*?)\s*,\s*(.*?)\)/gi, "COALESCE($1, $2)")

    // IIF(condition, trueVal, falseVal) -> CASE WHEN condition THEN trueVal ELSE falseVal END
    sql = sql.replace(/IIF\s*\(\s*([\s\S]*?)\s*,\s*([\s\S]*?)\s*,\s*([\s\S]*?)\)/gi, "CASE WHEN $1 THEN $2 ELSE $3 END")

    // ISNULL(val) -> val IS NULL
    sql = sql.replace(/ISNULL\((.*?)\)/gi, "$1 IS NULL")

    // DECODE(val, search1, result1, search2, result2, defaultResult) -> CASE val WHEN search1 THEN result1 WHEN search2 THEN result2 ELSE defaultResult END
    sql = sql.replace(/DECODE\s*\(\s*(\w+)\s*,\s*([\s\S]*?)\)/gi, (_, col, body) => {
      const parts = body.split(",").map((p: string) => p.trim())
      let caseSql = `CASE ${col}\n`
      for (let i = 0; i < parts.length - 1; i += 2) {
        caseSql += `  WHEN ${parts[i]} THEN ${parts[i + 1]}\n`
      }
      if (parts.length % 2 === 1) {
        caseSql += `  ELSE ${parts[parts.length - 1]}\n`
      }
      caseSql += `END`
      return caseSql
    })

    // Dialect-specific function conversions
    if (dialect === "db2") {
      sql = sql.replace(/SUBSTR\(/gi, "SUBSTR(")
      sql = sql.replace(/ADD_TO_DATE\((.*?),\s*'DD'\s*,\s*(.*?)\)/gi, "$1 + $2 DAYS")
      sql = sql.replace(/TO_CHAR\(/gi, "VARCHAR_FORMAT(")
    } else if (dialect === "snowflake") {
      sql = sql.replace(/ADD_TO_DATE\((.*?),\s*'(.*?)'\s*,\s*(.*?)\)/gi, "DATEADD($2, $3, $1)")
      sql = sql.replace(/TO_CHAR\(/gi, "TO_VARCHAR(")
    } else if (dialect === "postgres") {
      sql = sql.replace(/ADD_TO_DATE\((.*?),\s*'DD'\s*,\s*(.*?)\)/gi, "$1 + INTERVAL '$2 days'")
    }

    return sql
  }, [exprInput, dialect])

  const handleCopy = () => {
    navigator.clipboard.writeText(transpiledOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono mb-2">
            <Code2 className="h-3.5 w-3.5" />
            <span>Expression Validation Workbench</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Informatica Expression Function Transpiler</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Validate and convert long Informatica PowerCenter & IICS transformation expressions (`IIF`, `DECODE`, `ISNULL`, `ADD_TO_DATE`) into production database SQL.
          </p>
        </div>

        {/* Dialect Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0">
          <span className="text-xs text-white/60 font-mono px-2">Dialect:</span>
          {(["db2", "snowflake", "postgres", "oracle", "bigquery"] as TargetDialect[]).map((d) => (
            <button
              key={d}
              onClick={() => setDialect(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                dialect === d
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Examples */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Example Expressions:</span>
        {EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => setExprInput(ex.expr)}
            className="px-3 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 text-xs text-white/80 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Code Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Informatica Expression Input */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-purple-400" />
                <span>Informatica Expression Syntax</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/60">
                Paste PowerCenter / IICS transformation logic
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="320px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={exprInput}
                onChange={(val) => setExprInput(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right: Transpiled Database SQL */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Transpiled {dialect.toUpperCase()} SQL</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/60">
                Equivalent SQL syntax for query overrides
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={handleCopy}
              className="bg-white text-black hover:bg-white/90 text-xs font-medium inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy SQL"}</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="320px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={transpiledOutput}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
