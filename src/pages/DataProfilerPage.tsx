import { useState, useMemo } from "react"
import { BarChart3, Upload, AlertTriangle, CheckCircle2, Database, Table, HelpCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

const SAMPLE_PROFILER_CSV = `transaction_id,customer_id,amount,payment_method,status,created_at,note
TX1001,CUST_881,149.99,credit_card,COMPLETED,2024-01-10 14:22:00,Standard order
TX1002,CUST_412,49.50,paypal,COMPLETED,2024-01-10 14:25:12,
TX1003,CUST_881,299.00,credit_card,FAILED,2024-01-10 14:30:00,Insufficient funds
TX1004,CUST_905,12.00,apple_pay,COMPLETED,2024-01-10 14:45:10,
TX1005,CUST_114,850.00,bank_transfer,PENDING,2024-01-10 15:00:00,High value check
TX1006,CUST_412,49.50,paypal,COMPLETED,2024-01-10 15:10:00,
TX1007,,120.00,credit_card,REFUNDED,2024-01-10 15:20:00,Missing customer id
TX1008,CUST_330,0.00,promo_code,COMPLETED,2024-01-10 15:30:00,Free trial`

interface ColumnProfile {
  name: string
  inferredType: "INTEGER" | "FLOAT" | "BOOLEAN" | "DATE/TIMESTAMP" | "TEXT"
  nullCount: number
  nullPct: number
  uniqueCount: number
  uniquePct: number
  minVal?: string | number
  maxVal?: string | number
  meanVal?: string | number
  topValues: { value: string; count: number }[]
  warnings: string[]
}

export default function DataProfilerPage() {
  const [csvContent, setCsvContent] = useState(SAMPLE_PROFILER_CSV)

  // Compute Data Profile
  const profileResult = useMemo(() => {
    const lines = csvContent.trim().split("\n").map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return null

    const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.replace(/^["']|["']$/g, "").trim())
      const rowObj: Record<string, string> = {}
      headers.forEach((h, idx) => {
        rowObj[h] = vals[idx] ?? ""
      })
      rows.push(rowObj)
    }

    const totalRows = rows.length
    const totalCols = headers.length
    const globalWarnings: string[] = []

    // Column Profiling
    const columnProfiles: ColumnProfile[] = headers.map((header) => {
      let nullCount = 0
      const valueFreq: Record<string, number> = {}
      const numericVals: number[] = []
      const warnings: string[] = []

      let isInt = true
      let isFloat = true
      let isBool = true
      let isDate = true
      let nonNullCount = 0

      rows.forEach((row) => {
        const val = row[header]
        if (val === "" || val === undefined || val === null) {
          nullCount++
        } else {
          nonNullCount++
          valueFreq[val] = (valueFreq[val] || 0) + 1

          // Trailing whitespace check
          if (val !== val.trim()) {
            if (!warnings.includes("Trailing/leading whitespace detected")) {
              warnings.push("Trailing/leading whitespace detected")
            }
          }

          if (isInt && !/^-?\d+$/.test(val)) isInt = false
          if (isFloat && !/^-?\d+(\.\d+)?$/.test(val)) isFloat = false
          if (isBool && !/^(true|false|1|0)$/i.test(val)) isBool = false
          if (isDate && isNaN(Date.parse(val))) isDate = false

          const num = Number(val)
          if (!isNaN(num) && val !== "") {
            numericVals.push(num)
          }
        }
      })

      const nullPct = totalRows > 0 ? (nullCount / totalRows) * 100 : 0
      const uniqueCount = Object.keys(valueFreq).length
      const uniquePct = nonNullCount > 0 ? (uniqueCount / nonNullCount) * 100 : 0

      if (nullPct > 20) {
        warnings.push(`High NULL rate (${nullPct.toFixed(1)}%)`)
      }

      let inferredType: ColumnProfile["inferredType"] = "TEXT"
      if (nonNullCount > 0) {
        if (isInt) inferredType = "INTEGER"
        else if (isFloat) inferredType = "FLOAT"
        else if (isBool) inferredType = "BOOLEAN"
        else if (isDate) inferredType = "DATE/TIMESTAMP"
      }

      // Compute Top 3 Values
      const topValues = Object.entries(valueFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([value, count]) => ({ value, count }))

      // Compute Numeric Stats
      let minVal, maxVal, meanVal
      if (numericVals.length > 0) {
        minVal = Math.min(...numericVals)
        maxVal = Math.max(...numericVals)
        meanVal = (numericVals.reduce((a, b) => a + b, 0) / numericVals.length).toFixed(2)
      }

      return {
        name: header,
        inferredType,
        nullCount,
        nullPct,
        uniqueCount,
        uniquePct,
        minVal,
        maxVal,
        meanVal,
        topValues,
        warnings,
      }
    })

    const totalNullCells = columnProfiles.reduce((acc, c) => acc + c.nullCount, 0)
    const overallHealthScore = Math.max(0, Math.round(100 - (totalNullCells / (totalRows * totalCols || 1)) * 50))

    return { totalRows, totalCols, columnProfiles, globalWarnings, overallHealthScore }
  }, [csvContent])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      if (content) setCsvContent(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Data Profiler & Health Inspector</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Instant statistical health check, data type detection, and anomaly diagnostic report for CSV datasets. 100% client-side.
        </p>
      </div>

      {/* Input / Control Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Dataset Input</CardTitle>
            <label htmlFor="csv-profiler-upload">
              <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                  Upload CSV File
                </span>
              </Button>
              <input id="csv-profiler-upload" type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full h-32 p-3 font-mono text-xs rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste CSV rows here..."
          />
        </CardContent>
      </Card>

      {/* Profiling Report */}
      {profileResult && (
        <div className="space-y-6">
          {/* Executive Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Table className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
                  <p className="text-2xl font-bold">{profileResult.totalRows.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Columns Profiled</p>
                  <p className="text-2xl font-bold">{profileResult.totalCols}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Data Health Score</p>
                  <p className="text-2xl font-bold">{profileResult.overallHealthScore} / 100</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Column Warnings</p>
                  <p className="text-2xl font-bold">
                    {profileResult.columnProfiles.reduce((acc, c) => acc + c.warnings.length, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column Profile Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Column Breakdown & Quality Metrics</CardTitle>
              <CardDescription className="text-xs">Detailed statistical distributions per column.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-3 font-semibold">Column Name</th>
                      <th className="p-3 font-semibold">Inferred Type</th>
                      <th className="p-3 font-semibold">Null Rate</th>
                      <th className="p-3 font-semibold">Cardinality (Unique)</th>
                      <th className="p-3 font-semibold">Numeric Summary (Min / Max / Mean)</th>
                      <th className="p-3 font-semibold">Top Values</th>
                      <th className="p-3 font-semibold">Quality Alerts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profileResult.columnProfiles.map((col) => (
                      <tr key={col.name} className="hover:bg-muted/20">
                        <td className="p-3 font-mono font-medium">{col.name}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {col.inferredType}
                          </Badge>
                        </td>
                        <td className="p-3 w-40">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>{col.nullCount} nulls</span>
                              <span>{col.nullPct.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, col.nullPct))}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{col.uniqueCount}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">({col.uniquePct.toFixed(0)}%)</span>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {col.minVal !== undefined ? (
                            <div>
                              <span>Min: {col.minVal}</span> | <span>Max: {col.maxVal}</span> | <span>Avg: {col.meanVal}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {col.topValues.map((tv, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                {tv.value || '""'} ({tv.count})
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          {col.warnings.length > 0 ? (
                            <div className="space-y-1">
                              {col.warnings.map((w, idx) => (
                                <Badge key={idx} variant="destructive" className="text-[10px] py-0.5 px-1.5 font-normal block w-fit">
                                  {w}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                              Clean
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
