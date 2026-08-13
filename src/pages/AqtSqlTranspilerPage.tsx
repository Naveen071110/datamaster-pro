import { useState, useMemo } from "react"
import { GitCompare, Copy, Check, Terminal } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import Editor from "@monaco-editor/react"

const SAMPLE_AQT_DB2_SQL = `-- AQT Script & IBM DB2 Mainframe Dialect Query
--ctrl options fetch_first_only=yes
SELECT 
  e.EMPNO, 
  e.FIRSTNME || ' ' || e.LASTNAME AS FULL_NAME, 
  d.DEPTNAME,
  COALESCE(e.SALARY, 0) AS SALARY,
  CURRENT DATE AS EXTRACT_DT
FROM EMPLOYEE e
INNER JOIN DEPARTMENT d ON e.WORKDEPT = d.DEPTNO
WHERE e.SALARY > 50000
  AND e.HIREDATE >= CURRENT DATE - 5 YEARS
WITH RR
FETCH FIRST 100 ROWS ONLY;`

export default function AqtSqlTranspilerPage() {
  const [inputSql, setInputSql] = useState(SAMPLE_AQT_DB2_SQL)
  const [targetDialect, setTargetDialect] = useState<"snowflake" | "postgres" | "bigquery">("snowflake")
  const [copied, setCopied] = useState(false)

  const transpiledSql = useMemo(() => {
    if (!inputSql.trim()) return ""

    let sql = inputSql

    // Remove AQT --ctrl directives
    sql = sql.replace(/--ctrl.*?\n/gi, "")

    // Remove DB2 Isolation level clauses (WITH RR, WITH RS, WITH CS, WITH UR)
    sql = sql.replace(/WITH\s+(RR|RS|CS|UR)/gi, "")

    // FETCH FIRST n ROWS ONLY -> LIMIT n
    sql = sql.replace(/FETCH\s+FIRST\s+(\d+)\s+ROWS?\s+ONLY/gi, "LIMIT $1")

    // CURRENT DATE - n YEARS -> CURRENT_DATE() - INTERVAL 'n years'
    if (targetDialect === "postgres") {
      sql = sql.replace(/CURRENT\s+DATE\s*-\s*(\d+)\s+YEARS/gi, "CURRENT_DATE - INTERVAL '$1 years'")
      sql = sql.replace(/CURRENT\s+DATE/gi, "CURRENT_DATE")
    } else if (targetDialect === "snowflake") {
      sql = sql.replace(/CURRENT\s+DATE\s*-\s*(\d+)\s+YEARS/gi, "DATEADD(year, -$1, CURRENT_DATE())")
      sql = sql.replace(/CURRENT\s+DATE/gi, "CURRENT_DATE()")
    } else if (targetDialect === "bigquery") {
      sql = sql.replace(/CURRENT\s+DATE\s*-\s*(\d+)\s+YEARS/gi, "DATE_SUB(CURRENT_DATE(), INTERVAL $1 YEAR)")
      sql = sql.replace(/CURRENT\s+DATE/gi, "CURRENT_DATE()")
    }

    return sql.trim()
  }, [inputSql, targetDialect])

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-2">
            <GitCompare className="h-3.5 w-3.5" />
            <span>AQT & DB2 Cross-Migration Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AQT & DB2 Mainframe to Snowflake / Postgres Transpiler</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Convert Advanced Query Tool (AQT) scripts and DB2 mainframe queries (`FETCH FIRST`, `WITH RR`, `CURRENT DATE - YEARS`) into modern cloud data warehouse SQL.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0">
          <span className="text-xs text-white/60 font-mono px-2">Target Cloud Dialect:</span>
          {(["snowflake", "postgres", "bigquery"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setTargetDialect(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                targetDialect === d ? "bg-white text-black font-semibold shadow-md" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">AQT & DB2 Mainframe SQL Input</CardTitle>
            <CardDescription className="text-xs text-white/60">Paste DB2 queries or AQT automation scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="340px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={inputSql}
                onChange={(val) => setInputSql(val || "")}
                options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">Transpiled {targetDialect.toUpperCase()} SQL</CardTitle>
              <CardDescription className="text-xs text-white/60">Clean modern ANSI SQL query</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(transpiledSql)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="bg-white text-black hover:bg-white/90 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1">{copied ? "Copied!" : "Copy SQL"}</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="340px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={transpiledSql}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
