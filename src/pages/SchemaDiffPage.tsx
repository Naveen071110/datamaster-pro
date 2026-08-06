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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Schema Diff & Drift Inspector</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Compare two database schemas to detect drift, column additions/deletions, and auto-generate ALTER migration scripts. 100% in-browser.
        </p>
      </div>

      {/* Schema Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">1. Base Schema (Current Production)</CardTitle>
            <CardDescription className="text-xs">Paste baseline CREATE TABLE DDL script.</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={schemaA}
              onChange={(e) => setSchemaA(e.target.value)}
              className="w-full h-56 p-3 font-mono text-xs rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">2. Target Schema (Proposed / New)</CardTitle>
            <CardDescription className="text-xs">Paste target CREATE TABLE DDL script.</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={schemaB}
              onChange={(e) => setSchemaB(e.target.value)}
              className="w-full h-56 p-3 font-mono text-xs rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>

      {/* Diff Analysis & ALTER Script */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Schema Comparison Summary</CardTitle>
            <CardDescription className="text-xs">Structural changes detected between schemas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Generated ALTER SQL */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Migration DDL Script</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="w-full h-64 p-3 font-mono text-xs rounded-md border border-input bg-muted/40 overflow-auto whitespace-pre-wrap leading-relaxed">
              <code>{diffResult.alterSql}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
