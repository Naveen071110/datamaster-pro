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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileCode className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">CSV to Multi-Dialect DDL Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Convert raw CSV or JSON into production-ready DDL schemas & insert scripts for any database dialect. 100% in-browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Data */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">1. Input CSV or JSON Data</CardTitle>
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Upload File
                  </span>
                </Button>
                <input id="file-upload" type="file" accept=".csv,.json,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <CardDescription className="text-xs">
              Paste raw CSV rows or a JSON array. Data never leaves your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="id,name,email\n1,Alice,alice@example.com"
              className="w-full h-72 p-3 font-mono text-xs rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {/* Options */}
            <div className="space-y-3 pt-2 border-t border-border">
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
          </CardContent>
        </Card>

        {/* Right Column: Generated DDL */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">2. Generated DDL</CardTitle>
                <Badge variant="outline" className="uppercase text-[10px] font-mono">
                  {dialect}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy SQL"}
                </Button>
                <Button variant="default" size="sm" onClick={handleDownload} className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              Inferred {columnsCount} columns across {rowsCount} rows.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <pre className="w-full h-full min-h-[380px] p-4 font-mono text-xs rounded-md border border-input bg-muted/40 overflow-auto whitespace-pre-wrap leading-relaxed">
              <code>{ddlOutput}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
