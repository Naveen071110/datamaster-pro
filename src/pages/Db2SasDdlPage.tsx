import { useState, useMemo } from "react"
import { Database, Copy, Check, Terminal, SlidersHorizontal } from "lucide-react"
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
  const [mode, setMode] = useState<"ddl" | "param">("param")
  const [dbName, setDbName] = useState("PRODDB")
  const [tsName, setTsName] = useState("TS_CUST01")
  const [tblName, setTblName] = useState("TB_CUSTOMER_MASTER")

  const [db2ParamQuery, setDb2ParamQuery] = useState(SAMPLE_DB2_PARAM_QUERY)
  const [db2ParamFile, setDb2ParamFile] = useState(SAMPLE_DB2_PARAM_FILE)

  const [copiedDb2, setCopiedDb2] = useState(false)
  const [copiedSas, setCopiedSas] = useState(false)
  const [copiedResolved, setCopiedResolved] = useState(false)

  // Mode 1: DDL & SAS Synthesizer
  const ddlOutput = useMemo(() => {
    let db2 = `-- IBM DB2 z/OS Mainframe Enterprise DDL Synthesizer\n`
    db2 += `CREATE DATABASE ${dbName}\n  STOGROUP SGPROD\n  BUFFERPOOL BP1\n  CCSID EBCDIC;\n\n`
    db2 += `CREATE TABLESPACE ${tsName}\n  IN ${dbName}\n  USING STOGROUP SGPROD\n  PRIQTY 1000 SECQTY 500\n  LOCKSIZE ROW\n  BUFFERPOOL BP1\n  CLOSE NO\n  COMPRESS YES;\n\n`
    db2 += `CREATE TABLE ${tblName} (\n`
    db2 += `  CUST_ID                  INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,\n`
    db2 += `  ACCOUNT_NUMBER           VARCHAR(30) NOT NULL,\n`
    db2 += `  CUSTOMER_NAME            VARCHAR(100) NOT NULL,\n`
    db2 += `  BALANCE_AMOUNT           DECIMAL(13,2) WITH DEFAULT 0.00,\n`
    db2 += `  EFFECTIVE_TIMESTAMP      TIMESTAMP NOT NULL WITH DEFAULT CURRENT TIMESTAMP,\n`
    db2 += `  PRIMARY KEY (CUST_ID)\n`
    db2 += `)\nIN ${dbName}.${tsName}\nCCSID EBCDIC;\n\n`
    db2 += `CREATE UNIQUE INDEX IX_${tblName}_01\n  ON ${tblName} (ACCOUNT_NUMBER)\n  BUFFERPOOL BP2;\n`

    let sas = `/* SAS Mainframe DB2 Integration & Extract Script */\n`
    sas += `LIBNAME DB2LIB DB2 SSID=DB2P SCHEMA=PRODSCHM;\n\n`
    sas += `/* Extract & Summarize DB2 Table via PROC SQL */\n`
    sas += `PROC SQL;\n`
    sas += `  CREATE TABLE WORK.CUST_SUMMARY AS\n`
    sas += `  SELECT\n    ACCOUNT_NUMBER,\n    CUSTOMER_NAME,\n    SUM(BALANCE_AMOUNT) AS TOTAL_BAL FORMAT=DOLLAR14.2\n`
    sas += `  FROM DB2LIB.${tblName}\n`
    sas += `  WHERE BALANCE_AMOUNT > 0\n`
    sas += `  GROUP BY ACCOUNT_NUMBER, CUSTOMER_NAME;\n`
    sas += `QUIT;\n\n`
    sas += `/* Generate Summary Report */\nPROC PRINT DATA=WORK.CUST_SUMMARY (OBS=50);\n  TITLE "IBM DB2 Mainframe Customer Balance Summary";\nRUN;`

    return { db2, sas }
  }, [dbName, tsName, tblName])

  // Mode 2: Host Variable & Macro Parameter Resolver
  const resolvedParamData = useMemo(() => {
    if (!db2ParamQuery.trim()) {
      return { resolvedSql: "-- Enter a DB2 or SAS query containing :param or &macro variables", detectedParams: {}, uniqueFoundParams: [] }
    }

    const paramMap: Record<string, string> = {}
    const lines = db2ParamFile.split("\n")
    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && (trimmed.includes("=") || trimmed.includes(":"))) {
        const parts = trimmed.split(/[:=]/)
        if (parts.length >= 2) {
          const key = line.split("=")[0].trim()
          const val = line.split("=").slice(1).join("=").trim()
          paramMap[key] = val
        }
      }
    })

    // Match :param or &macro
    const foundParams = Array.from(db2ParamQuery.matchAll(/([::&][A-Za-z0-9_]+)/g)).map((m) => m[0])
    const uniqueFoundParams = Array.from(new Set(foundParams))

    let resolvedSql = db2ParamQuery

    uniqueFoundParams.forEach((paramKey) => {
      if (paramMap[paramKey] !== undefined) {
        const val = paramMap[paramKey]
        const escapedKey = paramKey.replace(/&/g, "\\&").replace(/:/g, "\\:")
        resolvedSql = resolvedSql.replace(new RegExp(escapedKey, "g"), val)
      }
    })

    return { resolvedSql, detectedParams: paramMap, uniqueFoundParams }
  }, [db2ParamQuery, db2ParamFile])

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
            <Database className="h-3.5 w-3.5" />
            <span>IBM DB2 z/OS & SAS Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">IBM DB2 Mainframe & SAS Parameter Resolver</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Synthesize DB2 z/OS DDLs OR substitute DB2 host variables (`:param`) and SAS macro variables (`&macro`) with parameter file values into runnable production queries.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setMode("param")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${
              mode === "param" ? "bg-sky-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            1. DB2 & SAS Parameter Resolver
          </button>
          <button
            onClick={() => setMode("ddl")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${
              mode === "ddl" ? "bg-white text-black font-bold shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            2. DB2 DDL & SAS Synthesizer
          </button>
        </div>
      </div>

      {/* MODE 1: Parameter Resolver */}
      {mode === "param" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">1. Parameterized DB2 / SAS Query</CardTitle>
              <CardDescription className="text-xs text-white/60">Query with :host_var or &macro_var</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="360px" defaultLanguage="sql" theme="vs-dark" value={db2ParamQuery} onChange={(v) => setDb2ParamQuery(v || "")} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-sky-400">2. Parameter / Host Variable File</CardTitle>
              <CardDescription className="text-xs text-white/60">Key = Value parameter mapping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="280px" defaultLanguage="plaintext" theme="vs-dark" value={db2ParamFile} onChange={(v) => setDb2ParamFile(v || "")} />
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

          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-emerald-400">3. Runnable Substituted Query</CardTitle>
                <CardDescription className="text-xs text-white/60">Ready to execute in DB2 / SAS</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(resolvedParamData.resolvedSql)
                  setCopiedResolved(true)
                  setTimeout(() => setCopiedResolved(false), 2000)
                }}
                className="bg-white text-black hover:bg-white/90 text-xs"
              >
                {copiedResolved ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1">{copiedResolved ? "Copied!" : "Copy SQL"}</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="360px" defaultLanguage="sql" theme="vs-dark" value={resolvedParamData.resolvedSql} options={{ readOnly: true }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODE 2: DDL Synthesizer */}
      {mode === "ddl" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">Mainframe DB2 Parameters</CardTitle>
              <CardDescription className="text-xs text-white/60">Configure database & tablespace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Database Name:</label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Tablespace Name:</label>
                <input
                  type="text"
                  value={tsName}
                  onChange={(e) => setTsName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Table Name:</label>
                <input
                  type="text"
                  value={tblName}
                  onChange={(e) => setTblName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-white">DB2 z/OS DDL</CardTitle>
                <CardDescription className="text-xs text-white/60">Tablespace & Partitioning DDL</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(ddlOutput.db2)
                  setCopiedDb2(true)
                  setTimeout(() => setCopiedDb2(false), 2000)
                }}
                className="bg-white text-black hover:bg-white/90 text-xs"
              >
                {copiedDb2 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1">{copiedDb2 ? "Copied!" : "Copy"}</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="340px" defaultLanguage="sql" theme="vs-dark" value={ddlOutput.db2} options={{ readOnly: true }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-white">SAS PROC SQL Script</CardTitle>
                <CardDescription className="text-xs text-white/60">LIBNAME DB2 Extract</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(ddlOutput.sas)
                  setCopiedSas(true)
                  setTimeout(() => setCopiedSas(false), 2000)
                }}
                className="bg-white text-black hover:bg-white/90 text-xs"
              >
                {copiedSas ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1">{copiedSas ? "Copied!" : "Copy"}</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="340px" defaultLanguage="plaintext" theme="vs-dark" value={ddlOutput.sas} options={{ readOnly: true }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
