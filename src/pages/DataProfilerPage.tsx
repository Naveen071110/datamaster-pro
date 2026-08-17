import { useState, useMemo } from "react"
import { Upload, AlertTriangle, CheckCircle2, Database, Table } from "lucide-react"

// Quote-aware CSV line parser
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

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

    const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, "").trim())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const vals = parseCsvLine(lines[i]).map((v) => v.replace(/^["']|["']$/g, "").trim())
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

      // Compute Numeric Stats (using iterative loop to avoid V8 call stack limits on large arrays)
      let minVal, maxVal, meanVal
      if (numericVals.length > 0) {
        let sum = 0
        let min = numericVals[0]
        let max = numericVals[0]
        for (let i = 0; i < numericVals.length; i++) {
          const v = numericVals[i]
          sum += v
          if (v < min) min = v
          if (v > max) max = v
        }
        minVal = min
        maxVal = max
        meanVal = (sum / numericVals.length).toFixed(2)
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
    reader.onerror = () => {}
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      if (content) setCsvContent(content)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center border-l-2 border-white bg-white/15 px-3 py-1 backdrop-blur-md">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
              Data Quality Inspector
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 border border-white/15 bg-white/5 px-2.5 py-1 rounded-full">
            100% In-Browser
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-normal tracking-tight text-white">
          Data Profiler & Health Diagnostic
        </h1>
        <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
          Automated statistical health check, data type detection, NULL rate inspector, and quality anomaly warning engine for CSV datasets.
        </p>
      </div>

      {/* Input / Control Card */}
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-semibold text-white">Dataset Input</h2>
          <label htmlFor="csv-profiler-upload" className="cursor-pointer">
            <span className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              Upload CSV File
            </span>
            <input id="csv-profiler-upload" type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <textarea
          id="profiler-csv-input"
          aria-label="CSV Dataset Input"
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          className="w-full h-32 p-3 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white resize-none focus:outline-none focus:ring-1 focus:ring-white"
          placeholder="Paste CSV rows here..."
        />
      </div>

      {/* Empty State when no content */}
      {!profileResult && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center text-white/50 font-mono text-xs">
          Paste CSV rows above or upload a CSV file to inspect dataset quality metrics.
        </div>
      )}

      {/* Profiling Report */}
      {profileResult && (
        <div className="space-y-6">
          {/* Executive Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-5 flex items-center gap-4 shadow-lg">
              <div className="p-3 rounded-lg border border-white/20 bg-white/10 text-white">
                <Table className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-white/60 font-medium">Total Rows</p>
                <p className="text-2xl font-bold text-white">{profileResult.totalRows.toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-5 flex items-center gap-4 shadow-lg">
              <div className="p-3 rounded-lg border border-white/20 bg-white/10 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-white/60 font-medium">Columns Profiled</p>
                <p className="text-2xl font-bold text-white">{profileResult.totalCols}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-5 flex items-center gap-4 shadow-lg">
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-white/60 font-medium">Data Health Score</p>
                <p className="text-2xl font-bold text-emerald-400">{profileResult.overallHealthScore} / 100</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-5 flex items-center gap-4 shadow-lg">
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/20 text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-white/60 font-medium">Column Warnings</p>
                <p className="text-2xl font-bold text-amber-400">
                  {profileResult.columnProfiles.reduce((acc, c) => acc + c.warnings.length, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Column Profile Table */}
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-base font-semibold text-white">Column Breakdown & Quality Metrics</h2>
              <p className="text-xs text-white/60">Detailed statistical distributions per column.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-white/80">
                    <th className="p-3 font-semibold">Column Name</th>
                    <th className="p-3 font-semibold">Inferred Type</th>
                    <th className="p-3 font-semibold">Null Rate</th>
                    <th className="p-3 font-semibold">Cardinality (Unique)</th>
                    <th className="p-3 font-semibold">Numeric Summary (Min / Max / Mean)</th>
                    <th className="p-3 font-semibold">Top Values</th>
                    <th className="p-3 font-semibold">Quality Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {profileResult.columnProfiles.map((col) => (
                    <tr key={col.name} className="hover:bg-white/5">
                      <td className="p-3 font-mono font-medium text-white">{col.name}</td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] border border-white/20 px-2 py-0.5 rounded text-white">
                          {col.inferredType}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className={col.nullPct > 20 ? "text-rose-400 font-bold" : "text-white/80"}>
                          {col.nullCount} ({col.nullPct.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="p-3 font-mono text-white/80">
                        {col.uniqueCount} ({col.uniquePct.toFixed(0)}%)
                      </td>
                      <td className="p-3 font-mono text-white/70">
                        {col.minVal !== undefined ? `${col.minVal} .. ${col.maxVal} (avg ${col.meanVal})` : "N/A"}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-white/60">
                        {col.topValues.map((tv) => `${tv.value} (${tv.count})`).join(", ")}
                      </td>
                      <td className="p-3">
                        {col.warnings.length > 0 ? (
                          <div className="space-y-1">
                            {col.warnings.map((w, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 block w-fit">
                                {w}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Clean
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
