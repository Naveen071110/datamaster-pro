import { useCallback, useEffect, useState, useRef } from "react"
import { Play, RotateCcw, Database, History, Loader2, AlertCircle, Save, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { ErrorState } from "@/shared/components/ErrorState"
import { EmptyState } from "@/shared/components/EmptyState"
import { QueryEditor } from "@/features/sql-sandbox/components/QueryEditor"
import { ResultsTable } from "@/features/sql-sandbox/components/ResultsTable"
import { EditorTabs } from "@/features/sql-sandbox/components/EditorTabs"
import { SchemaExplorer } from "@/features/sql-sandbox/components/SchemaExplorer"
import { useAppStore } from "@/stores"

export default function SqlSandboxPage() {
  const {
    queryTabs, activeTabId, queryHistory, databaseReady, databaseError,
    addTab, closeTab, setActiveTab, updateTabSql,
    setTabResult, setTabError, setTabExecuting, setTabExecutionTime,
    addToHistory, clearResults, setDatabaseReady, setDatabaseError,
  } = useAppStore()

  const [db, setDb] = useState<any>(null)
  const [schema, setSchema] = useState<{ tableName: string; columns: { name: string; type: string }[] }[]>([])
  const [showSchema, setShowSchema] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const initialized = useRef(false)

  // Initialize SQL.js
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    setIsInitializing(true)

    ;(async () => {
      try {
        const { getDatabase, getSchema } = await import("@/features/sql-sandbox/utils/initDatabase")
        const database = await getDatabase()
        setDb(() => {
          const s = getSchema(database)
          setSchema(s)
          return database
        })
        setDatabaseReady(true)
        setIsInitializing(false)

        // Add initial tab
        addTab()
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load SQL engine"
        setInitError(msg)
        setDatabaseError(msg)
        setIsInitializing(false)
      }
    })()
  }, [addTab, setDatabaseReady, setDatabaseError])

  const activeTab = queryTabs.find((t) => t.id === activeTabId)

  const handleExecute = useCallback(async () => {
    if (!activeTab || !activeTab.sql.trim() || !db) return

    const startTime = performance.now()
    setTabExecuting(activeTab.id, true)

    try {
      const { executeQuery } = await import("@/features/sql-sandbox/utils/initDatabase")
      const result = executeQuery(db, activeTab.sql)
      const elapsed = Math.round(performance.now() - startTime)

      setTabResult(activeTab.id, result)
      setTabExecutionTime(activeTab.id, elapsed)

      addToHistory({
        id: Math.random().toString(36).substring(2, 9),
        sql: activeTab.sql,
        executedAt: new Date().toISOString(),
        executionTimeMs: elapsed,
        rowCount: result.rowCount,
        success: true,
      })
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime)
      setTabExecutionTime(activeTab.id, elapsed)
      setTabError(activeTab.id, err instanceof Error ? err.message : "Query execution failed")

      addToHistory({
        id: Math.random().toString(36).substring(2, 9),
        sql: activeTab.sql,
        executedAt: new Date().toISOString(),
        executionTimeMs: elapsed,
        rowCount: 0,
        success: false,
        errorMessage: err instanceof Error ? err.message : "Query execution failed",
      })
    } finally {
      setTabExecuting(activeTab.id, false)
    }
  }, [activeTab, db, setTabExecuting, setTabResult, setTabExecutionTime, setTabError, addToHistory])

  const handleSetExampleQuery = useCallback((sql: string) => {
    if (activeTabId) {
      updateTabSql(activeTabId, sql)
    }
  }, [activeTabId, updateTabSql])

  // Loading state
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="font-medium">Loading SQL Engine</p>
          <p className="text-sm text-muted-foreground mt-1">
            Initializing in-browser database with sample datasets...
          </p>
        </div>
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    )
  }

  // Error state
  if (initError) {
    return (
      <ErrorState
        title="SQL Engine Failed to Load"
        message={initError}
        onRetry={() => window.location.reload()}
      />
    )
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !db) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const content = evt.target?.result as string
      if (!content) return
      try {
        const { createTableFromCsv, getSchema } = await import("@/features/sql-sandbox/utils/initDatabase")
        const rawName = file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9_]/g, "_")
        const { tableName, rowCount } = createTableFromCsv(db, rawName, content)
        const updatedSchema = getSchema(db)
        setSchema(updatedSchema)
        if (activeTabId) {
          updateTabSql(activeTabId, `-- Table '${tableName}' created with ${rowCount} rows\nSELECT * FROM ${tableName} LIMIT 20;`)
        }
      } catch (err) {
        alert("Failed to parse CSV file: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={!activeTab || !activeTab.sql.trim() || activeTab?.isExecuting}
          >
            {activeTab?.isExecuting ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1.5" />
            )}
            Run
          </Button>

          <label htmlFor="sandbox-csv-upload">
            <Button variant="outline" size="sm" className="cursor-pointer gap-1 text-xs" asChild>
              <span>
                <Database className="h-3.5 w-3.5" />
                Upload CSV Table
              </span>
            </Button>
            <input id="sandbox-csv-upload" type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={() => activeTabId && clearResults(activeTabId)}
            disabled={!activeTab?.result && !activeTab?.error}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            SQLite WASM Engine
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSchema(!showSchema)}
            className="text-xs gap-1"
          >
            <Database className="h-3.5 w-3.5" />
            Schema
            {showSchema ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Schema dropdown */}
      {showSchema && (
        <div className="border-b border-border bg-muted/5">
          <div className="px-4 py-2">
            <SchemaExplorer schema={schema} />
          </div>
        </div>
      )}

      {/* Editor tabs */}
      <EditorTabs
        tabs={queryTabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTab}
        onCloseTab={closeTab}
        onAddTab={addTab}
      />

      {/* Editor area */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab ? (
          <>
            <div className="flex-1 min-h-[150px]">
              <QueryEditor
                value={activeTab.sql}
                onChange={(val) => updateTabSql(activeTab.id, val)}
                onExecute={handleExecute}
                height="100%"
              />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-1.5 text-xs text-muted-foreground border-y border-border bg-muted/10">
              <div className="flex items-center gap-3">
                {activeTab.isExecuting && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Executing...
                  </span>
                )}
                {activeTab.executionTimeMs !== undefined && !activeTab.isExecuting && (
                  <span>{activeTab.executionTimeMs}ms</span>
                )}
                {activeTab.result && !activeTab.isExecuting && (
                  <span>{activeTab.result.rowCount} rows returned</span>
                )}
                {activeTab.error && (
                  <span className="text-destructive">Error</span>
                )}
              </div>

              {activeTab.result && activeTab.result.rows.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 py-0"
                    onClick={() => {
                      if (!activeTab.result) return
                      const cols = activeTab.result.columns
                      const csvRows = [cols.join(",")]
                      activeTab.result.rows.forEach((r) => {
                        const vals = cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`)
                        csvRows.push(vals.join(","))
                      })
                      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "query_results.csv"
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 py-0"
                    onClick={() => {
                      if (!activeTab.result) return
                      const jsonStr = JSON.stringify(activeTab.result.rows, null, 2)
                      const blob = new Blob([jsonStr], { type: "application/json" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "query_results.json"
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Export JSON
                  </Button>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 min-h-[100px] overflow-auto">
              {activeTab.error && (
                <div className="p-4">
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="text-sm font-mono whitespace-pre-wrap">{activeTab.error}</div>
                  </div>
                </div>
              )}
              {activeTab.result && (
                <div className="p-4">
                  {activeTab.result.columns.length > 0 ? (
                    <ResultsTable
                      columns={activeTab.result.columns}
                      rows={activeTab.result.rows}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Query executed successfully. {activeTab.result.affectedRows ?? 0} rows affected.
                    </div>
                  )}
                </div>
              )}
              {!activeTab.result && !activeTab.error && (
                <div className="p-4">
                  <EmptyState
                    title="Run a query to see results"
                    message="Type an SQL query above and click Run or press Cmd+Enter"
                    action={{
                      label: "Try an example",
                      onClick: () => handleSetExampleQuery("SELECT e.name, e.department, e.salary\nFROM employees e\nWHERE e.salary > 80000\nORDER BY e.salary DESC\nLIMIT 10;"),
                    }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title="No query tabs open"
              message="Open a new query tab to start writing SQL"
              action={{ label: "New Query", onClick: addTab }}
            />
          </div>
        )}
      </div>

      {/* Example queries quick access */}
      {activeTab && !activeTab.sql.trim() && (
        <div className="px-4 py-2 border-t border-border bg-muted/5">
          <p className="text-xs text-muted-foreground mb-2">Example queries:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Top salaries", sql: "SELECT name, department, salary FROM employees ORDER BY salary DESC LIMIT 5;" },
              { label: "Department counts", sql: "SELECT department, COUNT(*) as count, ROUND(AVG(salary), 0) as avg_salary FROM employees GROUP BY department ORDER BY count DESC;" },
              { label: "Log errors", sql: "SELECT level, COUNT(*) as count FROM logs GROUP BY level ORDER BY count DESC;" },
              { label: "Join orders", sql: "SELECT c.name, COUNT(o.order_id) as orders, ROUND(SUM(o.total), 2) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id ORDER BY total_spent DESC;" },
            ].map((ex) => (
              <Button
                key={ex.label}
                variant="outline"
                size="sm"
                className="text-[11px]"
                onClick={() => handleSetExampleQuery(ex.sql)}
              >
                {ex.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* History panel */}
      {queryHistory.length > 0 && (
        <div className="border-t border-border max-h-32 overflow-auto">
          <div className="px-4 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/10">
            <History className="h-3 w-3" />
            Recent Queries
          </div>
          {queryHistory.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="px-4 py-1 text-xs text-muted-foreground hover:bg-muted/20 cursor-pointer border-t border-border/30 flex items-center justify-between"
              onClick={() => handleSetExampleQuery(entry.sql)}
            >
              <code className="truncate max-w-[60%] font-mono">{entry.sql}</code>
              <span className="text-[10px] shrink-0">
                {entry.success ? `${entry.rowCount} rows` : "Error"} · {entry.executionTimeMs}ms
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
