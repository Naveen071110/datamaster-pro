import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Layers,
  Copy,
  Check,
  Download,
  Terminal,
  Database,
  FileCode,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  FileText,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

type Materialization = "view" | "table" | "incremental" | "ephemeral"

const SAMPLE_RAW_SQL = `SELECT
  order_id,
  customer_id,
  order_total_usd,
  order_status AS status,
  payment_method,
  created_at,
  updated_at
FROM raw_orders`

export default function DbtModelGeneratorPage() {
  const navigate = useNavigate()

  // State
  const [modelName, setModelName] = useState("stg_ecommerce__orders")
  const [materialization, setMaterialization] = useState<Materialization>("view")
  const [sourceName, setSourceName] = useState("raw_ecommerce")
  const [sourceTable, setSourceTable] = useState("orders")
  const [rawSql, setRawSql] = useState(SAMPLE_RAW_SQL)
  const [uniqueKey, setUniqueKey] = useState("order_id")
  const [watermarkColumn, setWatermarkColumn] = useState("updated_at")
  const [incrementalStrategy, setIncrementalStrategy] = useState("delete+insert")
  const [activeOutputTab, setActiveOutputTab] = useState<"sql" | "yaml">("sql")

  const [copied, setCopied] = useState(false)

  // Parse columns strictly from the SELECT clause
  const parsedColumns = useMemo(() => {
    const cols: { name: string; isPrimary: boolean; isNullable: boolean }[] = []
    
    // Extract text between SELECT and FROM if present
    const selectMatch = rawSql.match(/SELECT\s+([\s\S]*?)\s+FROM/i)
    const columnText = selectMatch ? selectMatch[1] : rawSql

    // Tokenize columns by top-level commas (respecting parentheses)
    const rawColTokens: string[] = []
    let depth = 0
    let cur = ""
    for (let i = 0; i < columnText.length; i++) {
      const c = columnText[i]
      if (c === "(") depth++
      else if (c === ")") depth = Math.max(0, depth - 1)

      if (c === "," && depth === 0) {
        if (cur.trim()) rawColTokens.push(cur.trim())
        cur = ""
      } else {
        cur += c
      }
    }
    if (cur.trim()) rawColTokens.push(cur.trim())

    rawColTokens.forEach((token) => {
      const trimmed = token.replace(/--.*$/, "").trim()
      if (!trimmed || /^(SELECT|FROM|WHERE|GROUP|ORDER|HAVING|LIMIT)/i.test(trimmed)) return

      const matchAs = trimmed.match(/(?:AS|as)\s+([a-zA-Z0-9_]+)$/)
      if (matchAs) {
        const colName = matchAs[1].trim()
        cols.push({
          name: colName,
          isPrimary: colName.toLowerCase() === uniqueKey.toLowerCase(),
          isNullable: !colName.toLowerCase().includes("id"),
        })
      } else {
        const matchCol = trimmed.match(/([a-zA-Z0-9_]+)$/)
        if (matchCol && !["SELECT", "FROM", "WHERE", "GROUP", "ORDER", "AS", "DISTINCT"].includes(matchCol[1].toUpperCase())) {
          const colName = matchCol[1].trim()
          cols.push({
            name: colName,
            isPrimary: colName.toLowerCase() === uniqueKey.toLowerCase(),
            isNullable: true,
          })
        }
      }
    })

    if (cols.length === 0) {
      return [
        { name: "order_id", isPrimary: true, isNullable: false },
        { name: "customer_id", isPrimary: false, isNullable: false },
        { name: "order_amount", isPrimary: false, isNullable: true },
        { name: "status", isPrimary: false, isNullable: true },
        { name: "order_timestamp", isPrimary: false, isNullable: false },
      ]
    }

    return cols
  }, [rawSql, uniqueKey])

  // Generate dbt SQL Model (.sql)
  const generatedDbtSql = useMemo(() => {
    let sql = `{{ config(\n`
    sql += `    materialized='${materialization}'`
    if (materialization === "incremental") {
      sql += `,\n    unique_key='${uniqueKey}',\n    incremental_strategy='${incrementalStrategy}'`
    }
    sql += `\n) }}\n\n`

    sql += `with source as (\n`
    sql += `    select * from {{ source('${sourceName}', '${sourceTable}') }}\n`
    sql += `),\n\n`

    sql += `renamed as (\n`
    sql += `    select\n`
    sql += parsedColumns.map((c) => `        ${c.name}`).join(",\n")
    sql += `\n    from source\n`
    if (materialization === "incremental") {
      sql += `    {% if is_incremental() %}\n`
      sql += `    where ${watermarkColumn} >= (select coalesce(max(${watermarkColumn}), '1970-01-01') from {{ this }})\n`
      sql += `    {% endif %}\n`
    }
    sql += `)\n\n`
    sql += `select * from renamed\n`

    return sql
  }, [materialization, uniqueKey, incrementalStrategy, watermarkColumn, sourceName, sourceTable, parsedColumns])

  // Generate dbt schema.yml
  const generatedSchemaYml = useMemo(() => {
    let yml = `version: 2\n\n`
    yml += `sources:\n`
    yml += `  - name: ${sourceName}\n`
    yml += `    description: "Raw operational database ingestion layer."\n`
    yml += `    tables:\n`
    yml += `      - name: ${sourceTable}\n`
    yml += `        description: "Raw source records for ${sourceTable}."\n\n`

    yml += `models:\n`
    yml += `  - name: ${modelName}\n`
    yml += `    description: "Cleaned and standardized staging model for ${sourceTable}."\n`
    yml += `    columns:\n`

    parsedColumns.forEach((col) => {
      yml += `      - name: ${col.name}\n`
      yml += `        description: "The unique ${col.name.replace(/_/g, " ")} identifier."\n`
      if (col.isPrimary) {
        yml += `        tests:\n`
        yml += `          - unique\n`
        yml += `          - not_null\n`
      } else if (!col.isNullable) {
        yml += `        tests:\n`
        yml += `          - not_null\n`
      }
      if (col.name.toLowerCase() === "status") {
        yml += `        tests:\n`
        yml += `          - accepted_values:\n`
        yml += `              values: ['COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED']\n`
      }
    })

    return yml
  }, [sourceName, sourceTable, modelName, parsedColumns])

  const handleCopy = () => {
    const text = activeOutputTab === "sql" ? generatedDbtSql : generatedSchemaYml
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const isSql = activeOutputTab === "sql"
    const text = isSql ? generatedDbtSql : generatedSchemaYml
    const filename = isSql ? `${modelName}.sql` : `schema_${modelName}.yml`
    const mime = isSql ? "application/sql" : "application/x-yaml"
    const blob = new Blob([text], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>dbt (data build tool) Model & Schema Hub</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">dbt Model & YAML Schema Synthesizer</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Convert raw queries into enterprise dbt SQL models with CTE patterns (`source()`, `ref()`), incremental hooks, and automated `schema.yml` documentation with tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => navigate("/sql-sandbox")}
            className="bg-white text-black hover:bg-white/90 text-xs font-medium"
          >
            <Terminal className="h-3.5 w-3.5 mr-1.5" />
            <span>Open in SQL Sandbox</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Column */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md p-5 space-y-4">
          <CardTitle className="text-sm font-semibold text-white">dbt Model Specifications</CardTitle>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono text-white/60 block mb-1">Model Name:</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-white/60 block mb-1">Materialization Strategy:</label>
              <div className="grid grid-cols-2 gap-2">
                {(["view", "table", "incremental", "ephemeral"] as Materialization[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMaterialization(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase border transition-all ${
                      materialization === m
                        ? "border-orange-400 bg-orange-400/20 text-orange-300 font-bold"
                        : "border-white/15 bg-white/5 text-white/60"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Source Name:</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Source Table:</label>
                <input
                  type="text"
                  value={sourceTable}
                  onChange={(e) => setSourceTable(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            {materialization === "incremental" && (
              <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/10 space-y-2">
                <span className="text-[11px] font-bold text-orange-300 block">Incremental Settings:</span>
                <div>
                  <label htmlFor="dbt-unique-key" className="text-[10px] font-mono text-white/70 block mb-0.5">Unique Key:</label>
                  <input
                    id="dbt-unique-key"
                    type="text"
                    value={uniqueKey}
                    onChange={(e) => setUniqueKey(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded px-2 py-1 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label htmlFor="dbt-watermark-col" className="text-[10px] font-mono text-white/70 block mb-0.5">Watermark Column (Timestamp / ID):</label>
                  <input
                    id="dbt-watermark-col"
                    type="text"
                    value={watermarkColumn}
                    onChange={(e) => setWatermarkColumn(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded px-2 py-1 text-xs font-mono text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-white/60 block mb-1">Raw Query / Input Logic:</label>
              <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0a0a0a]">
                <Editor height="160px" defaultLanguage="sql" theme="vs-dark" value={rawSql} onChange={(v) => setRawSql(v || "")} />
              </div>
            </div>
          </div>
        </Card>

        {/* Output Column */}
        <Card className="lg:col-span-2 border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveOutputTab("sql")}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeOutputTab === "sql" ? "bg-orange-500 text-black font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                1. {modelName}.sql
              </button>
              <button
                onClick={() => setActiveOutputTab("yaml")}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  activeOutputTab === "yaml" ? "bg-white text-black font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                2. schema.yml (Tests & Docs)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleDownload} className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>Download {activeOutputTab === "sql" ? ".sql" : ".yml"}</span>
              </Button>
              <Button size="sm" onClick={handleCopy} className="bg-white text-black hover:bg-white/90 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1.5">{copied ? "Copied!" : "Copy Code"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              {activeOutputTab === "sql" ? (
                <Editor height="460px" defaultLanguage="sql" theme="vs-dark" value={generatedDbtSql} options={{ readOnly: true }} />
              ) : (
                <Editor height="460px" defaultLanguage="yaml" theme="vs-dark" value={generatedSchemaYml} options={{ readOnly: true }} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
