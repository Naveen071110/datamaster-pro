import { useState, useMemo } from "react"
import { Terminal, Copy, Check, Sparkles } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import Editor from "@monaco-editor/react"

export default function EnterpriseSqlWorkbenchPage() {
  const [tblTarget, setTblTarget] = useState("TARGET_CUSTOMERS")
  const [tblSource, setTblSource] = useState("STG_CUSTOMERS")
  const [keyCol, setKeyCol] = useState("CUST_ID")
  const [dialect, setDialect] = useState<"snowflake" | "db2" | "postgres" | "oracle">("snowflake")
  const [copiedWindow, setCopiedWindow] = useState(false)
  const [copiedMerge, setCopiedMerge] = useState(false)

  const mergeSql = useMemo(() => {
    let sql = `-- Production ANSI MERGE (Upsert) Statement\n`
    sql += `-- Dialect: ${dialect.toUpperCase()}\n\n`
    sql += `MERGE INTO ${tblTarget} AS tgt\n`
    sql += `USING ${tblSource} AS src\n`
    sql += `  ON tgt.${keyCol} = src.${keyCol}\n`
    sql += `WHEN MATCHED THEN\n`
    sql += `  UPDATE SET\n`
    sql += `    tgt.CUST_NAME = src.CUST_NAME,\n`
    sql += `    tgt.EMAIL = src.EMAIL,\n`
    sql += `    tgt.BALANCE_AMT = src.BALANCE_AMT,\n`
    sql += `    tgt.UPDATE_TS = ${dialect === "db2" ? "CURRENT TIMESTAMP" : dialect === "oracle" ? "SYSDATE" : "CURRENT_TIMESTAMP()"}\n`
    sql += `WHEN NOT MATCHED THEN\n`
    sql += `  INSERT (\n`
    sql += `    ${keyCol},\n    CUST_NAME,\n    EMAIL,\n    BALANCE_AMT,\n    UPDATE_TS\n`
    sql += `  ) VALUES (\n`
    sql += `    src.${keyCol},\n    src.CUST_NAME,\n    src.EMAIL,\n    src.BALANCE_AMT,\n    ${dialect === "db2" ? "CURRENT TIMESTAMP" : dialect === "oracle" ? "SYSDATE" : "CURRENT_TIMESTAMP()"}\n`
    sql += `  );`
    return sql
  }, [tblTarget, tblSource, keyCol, dialect])

  const windowSql = useMemo(() => {
    let sql = `-- Advanced Analytical Window Function Query\n`
    sql += `SELECT\n`
    sql += `  CUST_ID,\n`
    sql += `  REGION,\n`
    sql += `  TRANSACTION_DATE,\n`
    sql += `  AMOUNT,\n`
    sql += `  ROW_NUMBER() OVER (PARTITION BY REGION ORDER BY TRANSACTION_DATE DESC) AS ROW_NUM,\n`
    sql += `  SUM(AMOUNT) OVER (\n`
    sql += `    PARTITION BY REGION\n`
    sql += `    ORDER BY TRANSACTION_DATE\n`
    sql += `    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n`
    sql += `  ) AS RUNNING_TOTAL_SALES,\n`
    sql += `  LAG(AMOUNT, 1, 0) OVER (PARTITION BY CUST_ID ORDER BY TRANSACTION_DATE) AS PREV_TRANSACTION_AMT\n`
    sql += `FROM TRANSACTION_FACT\n`
    sql += `WHERE TRANSACTION_DATE >= ${dialect === "db2" ? "CURRENT DATE - 30 DAYS" : "CURRENT_DATE() - INTERVAL '30 days'"};\n`
    return sql
  }, [dialect])

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-2">
            <Terminal className="h-3.5 w-3.5" />
            <span>Advanced Enterprise SQL Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise SQL Window Function & MERGE Workbench</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Synthesize complex analytical Window Functions (`ROW_NUMBER`, `LAG/LEAD`, Running Totals) and ANSI `MERGE INTO` Upsert queries.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0">
          <span className="text-xs text-white/60 font-mono px-2">Dialect:</span>
          {(["snowflake", "db2", "postgres", "oracle"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDialect(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                dialect === d ? "bg-white text-black font-semibold shadow-md" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">ANSI MERGE (Upsert) Synthesizer</CardTitle>
              <CardDescription className="text-xs text-white/60">Generate target/source MERGE queries</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(mergeSql)
                setCopiedMerge(true)
                setTimeout(() => setCopiedMerge(false), 2000)
              }}
              className="bg-white text-black hover:bg-white/90 text-xs"
            >
              {copiedMerge ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1">{copiedMerge ? "Copied!" : "Copy MERGE"}</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={tblTarget}
                onChange={(e) => setTblTarget(e.target.value)}
                placeholder="Target Table"
                className="bg-[#0a0a0a] border border-white/15 rounded px-2 py-1 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={tblSource}
                onChange={(e) => setTblSource(e.target.value)}
                placeholder="Source Table"
                className="bg-[#0a0a0a] border border-white/15 rounded px-2 py-1 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={keyCol}
                onChange={(e) => setKeyCol(e.target.value)}
                placeholder="Match Key"
                className="bg-[#0a0a0a] border border-white/15 rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="320px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={mergeSql}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">Window Function Query Generator</CardTitle>
              <CardDescription className="text-xs text-white/60">LAG, LEAD, Running Totals & Partitioning</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(windowSql)
                setCopiedWindow(true)
                setTimeout(() => setCopiedWindow(false), 2000)
              }}
              className="bg-white text-black hover:bg-white/90 text-xs"
            >
              {copiedWindow ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1">{copiedWindow ? "Copied!" : "Copy Query"}</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="355px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={windowSql}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
