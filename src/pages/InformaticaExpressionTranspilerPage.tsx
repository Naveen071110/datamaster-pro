import { useState, useMemo } from "react"
import { Code2, Copy, Check, Terminal } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
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

// Helper to split top-level comma arguments while respecting nested parentheses and string literals
function splitTopLevelArgs(str: string): string[] {
  const args: string[] = []
  let depth = 0
  let inString = false
  let stringChar = ""
  let current = ""

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (inString) {
      current += char
      if (char === stringChar && str[i - 1] !== "\\") {
        inString = false
      }
    } else if (char === "'" || char === '"') {
      inString = true
      stringChar = char
      current += char
    } else if (char === "(") {
      depth++
      current += char
    } else if (char === ")") {
      depth--
      current += char
    } else if (char === "," && depth === 0) {
      args.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  if (current.trim()) {
    args.push(current.trim())
  }
  return args
}

function transpileInformaticaExpression(input: string, dialect: TargetDialect): string {
  let result = input

  function transformFunctionCalls(str: string, fnName: string, transformer: (args: string[]) => string): string {
    let output = ""
    let pos = 0

    while (pos < str.length) {
      const upperStr = str.toUpperCase()
      const searchTarget = fnName.toUpperCase() + "("
      const idx = upperStr.indexOf(searchTarget, pos)
      if (idx === -1) {
        output += str.slice(pos)
        break
      }

      // Ensure not part of another word
      if (idx > 0 && /[A-Za-z0-9_]/.test(str[idx - 1])) {
        output += str.slice(pos, idx + searchTarget.length)
        pos = idx + searchTarget.length
        continue
      }

      output += str.slice(pos, idx)
      const startParen = idx + fnName.length
      let depth = 1
      let endParen = -1
      let inString = false
      let stringChar = ""

      for (let i = startParen + 1; i < str.length; i++) {
        const char = str[i]
        if (inString) {
          if (char === stringChar && str[i - 1] !== "\\") inString = false
        } else if (char === "'" || char === '"') {
          inString = true
          stringChar = char
        } else if (char === "(") {
          depth++
        } else if (char === ")") {
          depth--
          if (depth === 0) {
            endParen = i
            break
          }
        }
      }

      if (endParen !== -1) {
        const insideArgs = str.slice(startParen + 1, endParen)
        const innerTranspiled = transpileInformaticaExpression(insideArgs, dialect)
        const args = splitTopLevelArgs(innerTranspiled)
        output += transformer(args)
        pos = endParen + 1
      } else {
        output += str.slice(idx)
        break
      }
    }
    return output
  }

  // 1. IIF(cond, trueVal, falseVal) -> CASE WHEN
  result = transformFunctionCalls(result, "IIF", (args) => {
    if (args.length >= 3) {
      return `CASE WHEN ${args[0]} THEN ${args[1]} ELSE ${args[2]} END`
    } else if (args.length === 2) {
      return `CASE WHEN ${args[0]} THEN ${args[1]} ELSE NULL END`
    }
    return `IIF(${args.join(", ")})`
  })

  // 2. DECODE(val, s1, r1, s2, r2, def) -> CASE
  result = transformFunctionCalls(result, "DECODE", (args) => {
    if (args.length >= 3) {
      const col = args[0]
      let sql = `CASE ${col}`
      for (let i = 1; i < args.length - 1; i += 2) {
        sql += ` WHEN ${args[i]} THEN ${args[i + 1]}`
      }
      if (args.length % 2 === 0) {
        sql += ` ELSE ${args[args.length - 1]}`
      }
      sql += ` END`
      return sql
    }
    return `DECODE(${args.join(", ")})`
  })

  // 3. ISNULL(x) -> (x IS NULL)
  result = transformFunctionCalls(result, "ISNULL", (args) => {
    return `${args[0]} IS NULL`
  })

  // 4. ADD_TO_DATE
  result = transformFunctionCalls(result, "ADD_TO_DATE", (args) => {
    const dateCol = args[0] || "CURRENT_DATE"
    const unit = (args[1] || "'DD'").replace(/['"]/g, "").toUpperCase()
    const amount = args[2] || "0"

    const isYear = ["Y", "YY", "YYY", "YYYY", "YEAR"].includes(unit)
    const isMonth = ["M", "MM", "MON", "MONTH"].includes(unit)
    const isHour = ["H", "HH", "HH12", "HH24", "HOUR"].includes(unit)
    const isMinute = ["MI", "MINUTE"].includes(unit)
    const isSecond = ["S", "SS", "SECOND"].includes(unit)

    if (dialect === "postgres") {
      const pgUnit = isYear ? "year" : isMonth ? "month" : isHour ? "hour" : isMinute ? "minute" : isSecond ? "second" : "day"
      return `(${dateCol} + (${amount}) * INTERVAL '1 ${pgUnit}')`
    } else if (dialect === "snowflake") {
      const sfUnit = isYear ? "YEAR" : isMonth ? "MONTH" : isHour ? "HOUR" : isMinute ? "MINUTE" : isSecond ? "SECOND" : "DAY"
      return `DATEADD(${sfUnit}, ${amount}, ${dateCol})`
    } else if (dialect === "oracle") {
      return isMonth ? `ADD_MONTHS(${dateCol}, ${amount})` : isYear ? `ADD_MONTHS(${dateCol}, (${amount}) * 12)` : `(${dateCol} + ${amount})`
    } else if (dialect === "bigquery") {
      const bqUnit = isYear ? "YEAR" : isMonth ? "MONTH" : isHour ? "HOUR" : isMinute ? "MINUTE" : isSecond ? "SECOND" : "DAY"
      return `DATE_ADD(${dateCol}, INTERVAL ${amount} ${bqUnit})`
    } else {
      // db2
      const db2Unit = isYear ? "YEARS" : isMonth ? "MONTHS" : isHour ? "HOURS" : isMinute ? "MINUTES" : isSecond ? "SECONDS" : "DAYS"
      return `(${dateCol} + (${amount}) ${db2Unit})`
    }
  })

  // 5. TO_CHAR
  result = transformFunctionCalls(result, "TO_CHAR", (args) => {
    if (dialect === "db2") return `VARCHAR_FORMAT(${args.join(", ")})`
    if (dialect === "snowflake") return `TO_VARCHAR(${args.join(", ")})`
    if (dialect === "bigquery") return `FORMAT_DATE(${args[1] || "'%Y-%m-%d'"}, ${args[0]})`
    return `TO_CHAR(${args.join(", ")})`
  })

  return result
}

export default function InformaticaExpressionTranspilerPage() {
  const [exprInput, setExprInput] = useState(SAMPLE_EXPRESSION)
  const [dialect, setDialect] = useState<TargetDialect>("db2")
  const [copied, setCopied] = useState(false)

  // Transpile Informatica PowerCenter Expression to Target SQL
  const transpiledOutput = useMemo(() => {
    if (!exprInput.trim()) return ""
    return transpileInformaticaExpression(exprInput, dialect)
  }, [exprInput, dialect])

  const handleCopy = () => {
    navigator.clipboard.writeText(transpiledOutput).catch(() => {})
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
