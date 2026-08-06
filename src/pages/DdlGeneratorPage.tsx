import { useState, useMemo } from "react"
import { FileCode, Copy, Download, Upload, Check } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

type Dialect = "postgres" | "snowflake" | "bigquery" | "mysql" | "sqlite"

const DIALECT_TYPES: Record<Dialect, { string: string; integer: string; float: string; boolean: string; timestamp: string }> = {
  postgres: { string: "VARCHAR(255)", integer: "INTEGER", float: "NUMERIC(12,2)", boolean: "BOOLEAN", timestamp: "TIMESTAMP" },
  snowflake: { string: "VARCHAR(255)", integer: "NUMBER(38,0)", float: "FLOAT", boolean: "BOOLEAN", timestamp: "TIMESTAMP_NTZ" },
  bigquery: { string: "STRING", integer: "INT64", float: "FLOAT64", boolean: "BOOL", timestamp: "TIMESTAMP" },
  mysql: { string: "VARCHAR(255)", integer: "INT", float: "DECIMAL(12,2)", boolean: "TINYINT(1)", timestamp: "DATETIME" },
  sqlite: { string: "TEXT", integer: "INTEGER", float: "REAL", boolean: "INTEGER", timestamp: "TEXT" },
}

const SAMPLE_CSV = `id,first_name,last_name,email,salary,is_active,joined_date
1,Jane,Doe,jane.doe@company.com,95000.50,true,2023-01-15 09:00:00
2,John,Smith,john.smith@company.com,82000.00,true,2023-03-20 10:30:00
3,Alice,Johnson,alice.j@company.com,110000.75,false,2022-11-01 14:15:00`

export default function DdlGeneratorPage() {
  const [rawInput, setRawInput] = useState(SAMPLE_CSV)
  const [tableName, setTableName] = useState("imported_data")
  const [dialect, setDialect] = useState<Dialect>("postgres")
  const [includeInsert, setIncludeInsert] = useState(true)
  const [includeDropTable, setIncludeDropTable] = useState(true)
  const [copied, setCopied] = useState(false)

  // Parse CSV/JSON and infer DDL
  const { ddlOutput, columnsCount, rowsCount, inferredSchema } = useMemo(() => {
    let rows: Record<string, any>[] = []
    let headers: string[] = []

    const trimmed = rawInput.trim()
    if (!trimmed) {
      return { ddlOutput: "-- Paste or upload CSV/JSON data to generate DDL", columnsCount: 0, rowsCount: 0, inferredSchema: [] }
    }

    try {
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed)
        rows = Array.isArray(parsed) ? parsed : [parsed]
        headers = rows.length > 0 ? Object.keys(rows[0]) : []
      } else {
        const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean)
        if (lines.length > 0) {
          headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim())
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(",").map((v) => v.replace(/^["']|["']$/g, "").trim())
            const rowObj: Record<string, string> = {}
            headers.forEach((h, idx) => {
              rowObj[h] = vals[idx] ?? ""
            })
            rows.push(rowObj)
          }
        }
      }
    } catch {
      return { ddlOutput: "-- Invalid format. Please check your CSV or JSON syntax.", columnsCount: 0, rowsCount: 0, inferredSchema: [] }
    }

    if (headers.length === 0) {
      return { ddlOutput: "-- No columns found", columnsCount: 0, rowsCount: 0, inferredSchema: [] }
    }

    // Infer Data Types
    const typeMapping = DIALECT_TYPES[dialect]
    const inferredSchema = headers.map((header) => {
      let isInt = true
      let isFloat = true
      let isBool = true
      let isTimestamp = true

      for (const row of rows) {
        const val = String(row[header] ?? "").trim()
        if (!val) continue

        if (isInt && !/^-?\d+$/.test(val)) isInt = false
        if (isFloat && !/^-?\d+(\.\d+)?$/.test(val)) isFloat = false
        if (isBool && !/^(true|false|1|0)$/i.test(val)) isBool = false
        if (isTimestamp && isNaN(Date.parse(val))) isTimestamp = false
      }

      let inferredType = typeMapping.string
      if (isBool) inferredType = typeMapping.boolean
      else if (isInt) inferredType = typeMapping.integer
      else if (isFloat) inferredType = typeMapping.float
      else if (isTimestamp) inferredType = typeMapping.timestamp

      const cleanName = header.toLowerCase().replace(/[^a-z0-9_]/g, "_")
      return { originalName: header, colName: cleanName, type: inferredType }
    })

    // Build SQL output
    let sql = `-- Generated DDL for ${dialect.toUpperCase()}\n`
    sql += `-- Total Columns: ${headers.length} | Sample Rows: ${rows.length}\n\n`

    if (includeDropTable) {
      sql += `DROP TABLE IF EXISTS ${tableName};\n\n`
    }

    sql += `CREATE TABLE ${tableName} (\n`
    sql += inferredSchema.map((col) => `  ${col.colName.padEnd(20)} ${col.type}`).join(",\n")
    sql += `\n);\n`

    if (includeInsert && rows.length > 0) {
      sql += `\n-- Insert statements\n`
      sql += `INSERT INTO ${tableName} (${inferredSchema.map((c) => c.colName).join(", ")})\nVALUES\n`

      const valueTuples = rows.map((row) => {
        const vals = inferredSchema.map((col) => {
          const rawVal = row[col.originalName] ?? ""
          if (rawVal === "" || rawVal === null || rawVal === undefined) return "NULL"
          if (col.type.includes("INT") || col.type.includes("NUMERIC") || col.type.includes("FLOAT") || col.type.includes("REAL")) {
            return isNaN(Number(rawVal)) ? "NULL" : rawVal
          }
          if (col.type.includes("BOOL")) {
            return /^(true|1)$/i.test(String(rawVal)) ? "TRUE" : "FALSE"
          }
          return `'${String(rawVal).replace(/'/g, "''")}'`
        })
        return `  (${vals.join(", ")})`
      })

      sql += valueTuples.join(",\n") + `;\n`
    }

    return { ddlOutput: sql, columnsCount: headers.length, rowsCount: rows.length, inferredSchema }
  }, [rawInput, tableName, dialect, includeInsert, includeDropTable])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      if (content) {
        setRawInput(content)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9_]/g, "_")
        setTableName(nameWithoutExt || "imported_data")
      }
    }
    reader.readAsText(file)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(ddlOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([ddlOutput], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${tableName}_${dialect}.sql`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center border-l-2 border-white bg-white/15 px-3 py-1 backdrop-blur-md">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
              Multi-Dialect DDL Synthesizer
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 border border-white/15 bg-white/5 px-2.5 py-1 rounded-full">
            100% In-Browser
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-normal tracking-tight text-white">
          CSV to Production DDL Generator
        </h1>
        <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
          Instantly infer database schema types from CSV or JSON files and generate CREATE TABLE & INSERT statements across PostgreSQL, Snowflake, BigQuery, MySQL, and SQLite.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Data */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white">1. Input CSV or JSON Data</h2>
            <label htmlFor="ddl-file-upload" className="cursor-pointer">
              <span className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Upload File
              </span>
              <input id="ddl-file-upload" type="file" accept=".csv,.json" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          <p className="text-xs text-white/60">
            Paste raw CSV rows or a JSON array. Data never leaves your device.
          </p>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full h-64 p-3 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white resize-none focus:outline-none focus:ring-1 focus:ring-white leading-relaxed"
            placeholder="Paste CSV headers and rows or JSON payload here..."
          />
          <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Target SQL Dialect</label>
                  <select
                    value={dialect}
                    onChange={(e) => setDialect(e.target.value as Dialect)}
                    className="w-full h-9 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="postgres">PostgreSQL / Redshift</option>
                    <option value="snowflake">Snowflake</option>
                    <option value="bigquery">Google BigQuery</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block">Table Name</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                    className="w-full h-9 px-3 font-mono text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="drop-table"
                    checked={includeDropTable}
                    onChange={(e) => setIncludeDropTable(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <label htmlFor="drop-table" className="text-xs cursor-pointer">
                    Include DROP TABLE IF EXISTS
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="include-insert"
                    checked={includeInsert}
                    onChange={(e) => setIncludeInsert(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <label htmlFor="include-insert" className="text-xs cursor-pointer">
                    Include INSERT INTO values
                  </label>
                </div>
              </div>
            </div>
          </div>

        {/* Right Column: Generated DDL */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">2. Generated DDL</h2>
              <span className="font-mono text-[10px] uppercase border border-white/20 bg-white/10 px-2 py-0.5 rounded text-white">
                {dialect}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy SQL"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="rounded-full bg-white text-black hover:bg-white/85 text-xs font-medium px-4 py-1.5 inline-flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-white/60">
            Inferred {columnsCount} columns across {rowsCount} rows.
          </p>
          <pre className="w-full h-full min-h-[380px] p-4 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white overflow-auto whitespace-pre-wrap leading-relaxed">
            <code>{ddlOutput}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
