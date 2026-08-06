import { useState, useMemo } from "react"
import { GitCompare, Copy, Check, ArrowRight, PlusCircle, MinusCircle, RefreshCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

const SAMPLE_SCHEMA_A = `CREATE TABLE users (
  id INT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  age INT,
  created_at TIMESTAMP
);`

const SAMPLE_SCHEMA_B = `CREATE TABLE users (
  id INT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  is_active BOOLEAN,
  age BIGINT,
  updated_at TIMESTAMP
);`

interface ColumnDef {
  name: string
  type: string
}

function parseColumns(sql: string): ColumnDef[] {
  const lines = sql.split("\n")
  const cols: ColumnDef[] = []
  for (const line of lines) {
    const trimmed = line.trim().replace(/,$/, "")
    if (!trimmed || trimmed.toUpperCase().startsWith("CREATE TABLE") || trimmed.startsWith(");")) continue
    const parts = trimmed.split(/\s+/)
    if (parts.length >= 2 && !parts[0].toUpperCase().startsWith("PRIMARY") && !parts[0].toUpperCase().startsWith("CONSTRAINT")) {
      const colName = parts[0].replace(/[`"']/g, "")
      const colType = parts.slice(1).join(" ")
      cols.push({ name: colName.toLowerCase(), type: colType.toUpperCase() })
    }
  }
  return cols
}

export default function SchemaDiffPage() {
  const [schemaA, setSchemaA] = useState(SAMPLE_SCHEMA_A)
  const [schemaB, setSchemaB] = useState(SAMPLE_SCHEMA_B)
  const [tableName, setTableName] = useState("users")
  const [copied, setCopied] = useState(false)

  const diffResult = useMemo(() => {
    const colsA = parseColumns(schemaA)
    const colsB = parseColumns(schemaB)

    const mapA = new Map(colsA.map((c) => [c.name, c.type]))
    const mapB = new Map(colsB.map((c) => [c.name, c.type]))

    const added: ColumnDef[] = []
    const removed: ColumnDef[] = []
    const modified: { name: string; oldType: string; newType: string }[] = []
    const unchanged: ColumnDef[] = []

    // Find added & modified
    colsB.forEach((colB) => {
      if (!mapA.has(colB.name)) {
        added.push(colB)
      } else {
        const typeA = mapA.get(colB.name)!
        if (typeA !== colB.type) {
          modified.push({ name: colB.name, oldType: typeA, newType: colB.type })
        } else {
          unchanged.push(colB)
        }
      }
    })

    // Find removed
    colsA.forEach((colA) => {
      if (!mapB.has(colA.name)) {
        removed.push(colA)
      }
    })

    // Generate ALTER TABLE Statements
    let alterSql = `-- Migration SQL to upgrade Source -> Target\n`
    if (added.length === 0 && removed.length === 0 && modified.length === 0) {
      alterSql += `-- Schemas are identical. No migrations required.\n`
    } else {
      added.forEach((col) => {
        alterSql += `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type};\n`
      })
      modified.forEach((mod) => {
        alterSql += `ALTER TABLE ${tableName} ALTER COLUMN ${mod.name} TYPE ${mod.newType};\n`
      })
      removed.forEach((col) => {
        alterSql += `-- WARNING: Destructive Action\nALTER TABLE ${tableName} DROP COLUMN ${col.name};\n`
      })
    }

    return { added, removed, modified, unchanged, alterSql }
  }, [schemaA, schemaB, tableName])

  const handleCopy = () => {
    navigator.clipboard.writeText(diffResult.alterSql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center border-l-2 border-white bg-white/15 px-3 py-1 backdrop-blur-md">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
              Schema Drift Inspector
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 border border-white/15 bg-white/5 px-2.5 py-1 rounded-full">
            100% In-Browser
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-normal tracking-tight text-white">
          Schema Diff & Migration Generator
        </h1>
        <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
          Compare baseline database DDL vs target DDL side-by-side to highlight added (+), removed (-), and modified (~) columns, generating migration ALTER TABLE scripts automatically.
        </p>
      </div>

      {/* Schema Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 space-y-3 shadow-xl">
          <h2 className="text-base font-semibold text-white">1. Base Schema (Current Production)</h2>
          <p className="text-xs text-white/60">Paste baseline CREATE TABLE DDL script.</p>
          <textarea
            value={schemaA}
            onChange={(e) => setSchemaA(e.target.value)}
            className="w-full h-56 p-3 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white resize-none focus:outline-none focus:ring-1 focus:ring-white leading-relaxed"
          />
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 space-y-3 shadow-xl">
          <h2 className="text-base font-semibold text-white">2. Target Schema (Proposed / New)</h2>
          <p className="text-xs text-white/60">Paste target CREATE TABLE DDL script.</p>
          <textarea
            value={schemaB}
            onChange={(e) => setSchemaB(e.target.value)}
            className="w-full h-56 p-3 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white resize-none focus:outline-none focus:ring-1 focus:ring-white leading-relaxed"
          />
        </div>
      </div>

      {/* Diff Analysis & ALTER Script */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 space-y-4 shadow-xl">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white">Schema Comparison Summary</h2>
            <p className="text-xs text-white/60">Structural changes detected between schemas.</p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-500/10">
                +{diffResult.added.length} Added
              </Badge>
              <Badge variant="outline" className="border-rose-500/40 text-rose-600 bg-rose-500/10">
                -{diffResult.removed.length} Removed
              </Badge>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">
                ~{diffResult.modified.length} Modified
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {diffResult.unchanged.length} Unchanged
              </Badge>
            </div>

            <div className="space-y-2">
              {diffResult.added.map((col) => (
                <div key={col.name} className="flex items-center justify-between p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400">
                    <PlusCircle className="h-4 w-4" />
                    <span>{col.name}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/30">
                    {col.type}
                  </Badge>
                </div>
              ))}

              {diffResult.modified.map((mod) => (
                <div key={mod.name} className="flex items-center justify-between p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 font-mono text-amber-600 dark:text-amber-400">
                    <RefreshCw className="h-4 w-4" />
                    <span>{mod.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="line-through text-muted-foreground">{mod.oldType}</span>
                    <ArrowRight className="h-3 w-3 text-amber-500" />
                    <span className="font-bold text-amber-600 dark:text-amber-400">{mod.newType}</span>
                  </div>
                </div>
              ))}

              {diffResult.removed.map((col) => (
                <div key={col.name} className="flex items-center justify-between p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs">
                  <div className="flex items-center gap-2 font-mono text-rose-600 dark:text-rose-400">
                    <MinusCircle className="h-4 w-4" />
                    <span>{col.name}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] border-rose-500/30">
                    {col.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generated ALTER SQL */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white">Migration DDL Script</h2>
            <button
              onClick={handleCopy}
              className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Migration SQL"}</span>
            </button>
          </div>
          <pre className="w-full h-64 p-3 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white overflow-auto whitespace-pre-wrap leading-relaxed">
            <code>{diffResult.alterSql}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
