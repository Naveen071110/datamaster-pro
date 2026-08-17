import { useState, useMemo } from "react"
import { BarChart3, Lightbulb, AlertTriangle, CheckCircle, XCircle, Info, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { EmptyState } from "@/shared/components/EmptyState"
import { cn } from "@/shared/utils/cn"
import Editor from "@monaco-editor/react"

interface AnalysisResult {
  operation: string
  cost: "low" | "medium" | "high"
  details: string
  suggestion?: string
}

interface OptimizationHint {
  type: "warning" | "error" | "info"
  message: string
  suggestion: string
  severity: "high" | "medium" | "low"
}

function analyzeQuery(sql: string): { plan: AnalysisResult[]; hints: OptimizationHint[]; tables: string[] } {
  const plan: AnalysisResult[] = []
  const hints: OptimizationHint[] = []
  const tables = new Set<string>()
  const upper = sql.toUpperCase().trim()

  // Extract table references (supports schema-qualified tables like SCHEMA.TABLE)
  const tableMatches = Array.from(sql.matchAll(/(?:FROM|JOIN)\s+([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)/gi))
  for (const m of tableMatches) {
    if (m[1] && !["SELECT", "WHERE", "GROUP", "ORDER", "JOIN", "ON", "LATERAL"].includes(m[1].toUpperCase())) {
      tables.add(m[1].toUpperCase())
    }
  }

  // Check for SELECT *
  if (upper.includes("SELECT *")) {
    hints.push({
      type: "warning",
      message: "SELECT * detected",
      suggestion: "Specify only the columns you need. This reduces I/O and allows index-only scans.",
      severity: "high",
    })
    plan.push({ operation: "Table Scan (all columns)", cost: "high", details: "Reading all columns from table" })
  } else {
    plan.push({ operation: "Index/Column Scan", cost: "low", details: "Reading only selected columns" })
  }

  // Check for missing WHERE
  if (!upper.includes("WHERE")) {
    hints.push({
      type: "warning",
      message: "No WHERE clause",
      suggestion: "Add a WHERE clause to filter rows early. Reading all rows is expensive for large tables.",
      severity: "high",
    })
    plan.push({ operation: "Full Table Scan", cost: "high", details: "Scanning all rows (no filter)" })
  } else {
    plan.push({ operation: "Filter (WHERE)", cost: "low", details: "Rows filtered by WHERE condition" })
  }

  // Check for JOIN without ON
  if (upper.includes("JOIN") && !upper.includes("ON ")) {
    hints.push({
      type: "error",
      message: "JOIN without ON condition (Cartesian product!)",
      suggestion: "Add an ON clause to specify how tables are related. Missing ON creates a Cartesian product.",
      severity: "high",
    })
    plan.push({ operation: "Cartesian Product", cost: "high", details: "Cross join without condition" })
  }

  // Check for GROUP BY + HAVING
  if (upper.includes("GROUP BY")) {
    plan.push({ operation: "Group By / Aggregation", cost: "medium", details: "Sorting and grouping rows" })
    if (upper.includes("HAVING")) {
      plan.push({ operation: "Having Filter", cost: "low", details: "Filtering groups post-aggregation" })
    }
  }

  // Check for ORDER BY
  if (upper.includes("ORDER BY")) {
    plan.push({ operation: "Sort (ORDER BY)", cost: "medium", details: "Sorting result set" })
  }

  // Check for DISTINCT (potentially expensive)
  if (upper.includes("DISTINCT")) {
    hints.push({
      type: "info",
      message: "DISTINCT detected",
      suggestion: "DISTINCT requires sorting all result rows. Consider if you can use GROUP BY or EXISTS instead.",
      severity: "medium",
    })
    plan.push({ operation: "Distinct Sort", cost: "medium", details: "Removing duplicate rows" })
  }

  // Check for NOT IN (often slower than NOT EXISTS)
  if (upper.includes("NOT IN")) {
    hints.push({
      type: "warning",
      message: "NOT IN can be slow with NULLs",
      suggestion: "Use NOT EXISTS instead. NOT IN returns no rows if the subquery contains NULL values.",
      severity: "medium",
    })
  }

  // Check for LIKE with leading wildcard
  const likeMatch = upper.match(/LIKE\s+'%/i)
  if (likeMatch) {
    hints.push({
      type: "warning",
      message: "Leading wildcard in LIKE pattern",
      suggestion: "Leading '%' prevents index usage. Consider full-text search or reverse indexing.",
      severity: "high",
    })
  }

  // Check for functions in WHERE
  const funcWhereMatch = upper.match(/WHERE\s+\w+\s*\(/)
  if (funcWhereMatch) {
    hints.push({
      type: "info",
      message: "Function in WHERE clause",
      suggestion: "Functions on columns in WHERE prevent index usage. Consider computed columns or function-based indexes.",
      severity: "medium",
    })
  }

  // Add table count context
  if (tables.size > 2) {
    hints.push({
      type: "info",
      message: `Query joins ${tables.size} tables`,
      suggestion: "Multi-table joins can be expensive. Ensure all join columns are indexed. Consider if you can denormalize.",
      severity: "low",
    })
  }

  return { plan, hints, tables: Array.from(tables) }
}

export default function PerformanceAnalyzerPage() {
  const [sql, setSql] = useState("")
  const [analyzed, setAnalyzed] = useState(false)

  const result = useMemo(() => {
    if (!sql.trim()) return null
    return analyzeQuery(sql)
  }, [sql, analyzed])

  const handleAnalyze = () => {
    setAnalyzed(true)
  }

  const handleExample = (query: string) => {
    setSql(query)
    setAnalyzed(true)
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Enter an SQL query to analyze its execution plan and get optimization hints.
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="border border-border rounded-md overflow-hidden">
            <Editor
              height="150px"
              defaultLanguage="sql"
              theme="vs-dark"
              value={sql}
              onChange={(val) => setSql(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: "off",
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAnalyze} disabled={!sql.trim()}>
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Analyze
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setSql(""); setAnalyzed(false) }}>
                Clear
              </Button>
            </div>
            <Badge variant="outline" className="text-[10px]">Educational Plan</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Example queries */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground py-1">Examples:</span>
        {[
          { label: "Full scan", sql: "SELECT * FROM employees;" },
          { label: "Join with filter", sql: "SELECT e.name, o.total\nFROM employees e\nJOIN orders o ON e.id = o.customer_id\nWHERE e.department = 'Engineering'\nORDER BY o.total DESC;" },
          { label: "Slow pattern", sql: "SELECT * FROM employees e\nWHERE e.salary > (\n  SELECT AVG(salary) FROM employees WHERE department = e.department\n);" },
        ].map((ex) => (
          <Button key={ex.label} variant="outline" size="sm" className="text-xs" onClick={() => handleExample(ex.sql)}>
            {ex.label}
          </Button>
        ))}
      </div>

      {/* Results */}
      {!result && analyzed && (
        <EmptyState title="Enter a query" message="Type or paste an SQL query above and click Analyze." />
      )}

      {result && analyzed && (
        <div className="space-y-6">
          {/* Tables involved */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Tables:</span>
            {result.tables.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>

          {/* Execution Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Execution Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.plan.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md text-sm border",
                      step.cost === "high" && "border-red-500/30 bg-red-500/5",
                      step.cost === "medium" && "border-yellow-500/30 bg-yellow-500/5",
                      step.cost === "low" && "border-green-500/30 bg-green-500/5"
                    )}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-xs">{step.operation}</div>
                      <div className="text-[10px] text-muted-foreground">{step.details}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        step.cost === "high" && "text-red-400",
                        step.cost === "medium" && "text-yellow-400",
                        step.cost === "low" && "text-green-400"
                      )}
                    >
                      {step.cost} cost
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimization Hints */}
          {result.hints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  Optimization Hints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.hints.map((hint, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-md border",
                      hint.severity === "high" && "border-red-500/30 bg-red-500/5",
                      hint.severity === "medium" && "border-yellow-500/30 bg-yellow-500/5",
                      hint.severity === "low" && "border-blue-500/30 bg-blue-500/5"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {hint.type === "error" && <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />}
                      {hint.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />}
                      {hint.type === "info" && <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />}
                      <div>
                        <div className="text-sm font-medium">{hint.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">{hint.suggestion}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!analyzed && (
        <EmptyState
          title="Ready to analyze"
          message="Type an SQL query and click Analyze to get an educational execution plan with optimization hints."
        />
      )}
    </div>
  )
}
