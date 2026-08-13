import { useState, useMemo } from "react"
import { Database, Copy, Check, FileCode, Terminal } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import Editor from "@monaco-editor/react"

const SAMPLE_COPYBOOK = `01 CUSTOMER-RECORD.
   05 CUST-ID          PIC 9(9)      COMP-3.
   05 CUST-NAME        PIC X(30).
   05 CUST-ACCOUNT-BAL PIC S9(7)V99  COMP-3.
   05 CUST-STATUS-CODE PIC X(02).
   05 LAST-TRANS-DATE  PIC 9(8).`

export default function CobolCopybookConverterPage() {
  const [copybookInput, setCopybookInput] = useState(SAMPLE_COPYBOOK)
  const [tableName, setTableName] = useState("CUSTOMER_RECORD")
  const [copiedDb2, setCopiedDb2] = useState(false)
  const [copiedSas, setCopiedSas] = useState(false)

  // Parse COBOL Copybook fields
  const converted = useMemo(() => {
    const lines = copybookInput.split("\n").map((l) => l.trim()).filter(Boolean)
    const fields: { colName: string; db2Type: string; sasType: string; length: number }[] = []

    lines.forEach((line) => {
      const match = line.match(/\d+\s+([A-Za-z0-9-]+)\s+PIC\s+([A-Za-z0-9()vV]+)/i)
      if (match) {
        const rawName = match[1]
        const pic = match[2].toUpperCase()
        const colName = rawName.replace(/-/g, "_").toLowerCase()

        let db2Type = "VARCHAR(255)"
        let sasType = "$30."
        let length = 30

        if (pic.includes("9") && (line.includes("COMP-3") || line.includes("COMP"))) {
          if (pic.includes("V")) {
            db2Type = "DECIMAL(11,2)"
            sasType = "11.2"
          } else {
            db2Type = "INTEGER"
            sasType = "9."
          }
        } else if (pic.startsWith("X")) {
          const lenMatch = pic.match(/X\((\d+)\)/)
          length = lenMatch ? parseInt(lenMatch[1], 10) : 10
          db2Type = `VARCHAR(${length})`
          sasType = `$${length}.`
        } else if (pic.startsWith("9")) {
          const lenMatch = pic.match(/9\((\d+)\)/)
          length = lenMatch ? parseInt(lenMatch[1], 10) : 8
          if (length <= 4) db2Type = "SMALLINT"
          else if (length <= 9) db2Type = "INTEGER"
          else db2Type = "BIGINT"
          sasType = `${length}.`
        }

        fields.push({ colName, db2Type, sasType, length })
      }
    })

    // Build DB2 z/OS DDL
    let db2Ddl = `-- IBM DB2 z/OS Mainframe Table DDL\n`
    db2Ddl += `-- Generated from COBOL Copybook\n\n`
    db2Ddl += `DROP TABLE ${tableName.toUpperCase()};\n\n`
    db2Ddl += `CREATE TABLE ${tableName.toUpperCase()} (\n`
    db2Ddl += fields.map((f) => `  ${f.colName.toUpperCase().padEnd(25)} ${f.db2Type}`).join(",\n")
    db2Ddl += `\n)\nIN DATABASE PRODDB\nCCSID EBCDIC\nCOMPRESS YES;\n`

    // Build SAS Data Step Script
    let sasScript = `/* SAS Mainframe Flat File Data Step Parser */\n`
    sasScript += `DATA WORK.${tableName.toUpperCase()};\n`
    sasScript += `  INFILE 'MAINFRAME.DATA.FILE.FLAT' LRECL=250 MISSOVER;\n`
    sasScript += `  INPUT\n`
    sasScript += fields.map((f) => `    ${f.colName.padEnd(22)} ${f.sasType}`).join("\n")
    sasScript += `;\nRUN;\n\n`
    sasScript += `/* Print summary */\nPROC CONTENTS DATA=WORK.${tableName.toUpperCase()};\nRUN;`

    return { db2Ddl, sasScript, fields }
  }, [copybookInput, tableName])

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono mb-2">
          <Database className="h-3.5 w-3.5" />
          <span>Mainframe & SAS Integration Suite</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">COBOL Copybook to DB2 DDL & SAS Data Step Converter</h1>
        <p className="text-white/70 text-sm mt-1 max-w-2xl">
          Parse COBOL Copybook `PIC` definitions into IBM DB2 z/OS DDL tables and SAS `DATA` step ETL scripts.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Copybook */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">COBOL Copybook Input</CardTitle>
            <CardDescription className="text-xs text-white/60">Paste 01 level field definitions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-mono text-white/60 block mb-1">Target Table Name:</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="320px"
                defaultLanguage="plaintext"
                theme="vs-dark"
                value={copybookInput}
                onChange={(val) => setCopybookInput(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: "on",
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* DB2 z/OS DDL */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">IBM DB2 z/OS DDL</CardTitle>
              <CardDescription className="text-xs text-white/60">EBCDIC compressed DDL</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(converted.db2Ddl)
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
                height="380px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={converted.db2Ddl}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* SAS Data Step */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">SAS DATA Step Script</CardTitle>
              <CardDescription className="text-xs text-white/60">PROC CONTENTS & INFILE</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(converted.sasScript)
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
                height="380px"
                defaultLanguage="plaintext"
                theme="vs-dark"
                value={converted.sasScript}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
