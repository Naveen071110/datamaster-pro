import { useState, useMemo } from "react"
import { Database, Copy, Check, FileText } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import Editor from "@monaco-editor/react"

export default function Db2SasDdlPage() {
  const [dbName, setDbName] = useState("PRODDB")
  const [tsName, setTsName] = useState("TS_CUST01")
  const [tblName, setTblName] = useState("TB_CUSTOMER_MASTER")
  const [copiedDb2, setCopiedDb2] = useState(false)
  const [copiedSas, setCopiedSas] = useState(false)

  const output = useMemo(() => {
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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
          <Database className="h-3.5 w-3.5" />
          <span>IBM DB2 z/OS & SAS Engine</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">IBM DB2 Mainframe DDL & SAS Script Synthesizer</h1>
        <p className="text-white/70 text-sm mt-1 max-w-2xl">
          Construct production IBM DB2 z/OS Tablespaces, EBCDIC DDLs, and SAS LIBNAME / PROC SQL ETL extraction scripts.
        </p>
      </div>

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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">DB2 z/OS DDL</CardTitle>
              <CardDescription className="text-xs text-white/60">Tablespace & Partitioning DDL</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(output.db2)
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
              <Editor
                height="340px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={output.db2}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">SAS PROC SQL Script</CardTitle>
              <CardDescription className="text-xs text-white/60">LIBNAME DB2 Extract</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(output.sas)
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
              <Editor
                height="340px"
                defaultLanguage="plaintext"
                theme="vs-dark"
                value={output.sas}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
