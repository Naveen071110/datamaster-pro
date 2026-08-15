import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Table as TableIcon,
  FileCode,
  Terminal,
  Database,
  Search,
  Filter,
  Sliders,
  Play,
  Layers,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

type EntityType = "users" | "orders" | "companies" | "financial_ledger" | "server_logs"

interface FieldDef {
  name: string
  type: string
  enabled: boolean
}

// In-browser high-speed generator dictionaries for guaranteed 100% uptime & zero network lag
const FIRST_NAMES = ["James", "Emma", "Liam", "Olivia", "Noah", "Sophia", "Lucas", "Ava", "Mason", "Isabella", "Ethan", "Mia", "Oliver", "Harper", "Aiden", "Evelyn", "Priya", "Rahul", "Chen", "Mei", "Carlos", "Elena", "Yuki", "Kenji", "Fatima", "Tariq"]
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Patel", "Sharma", "Wang", "Zhang", "Tanaka", "Sato", "Al-Mansoor", "Khan", "Dubois", "Müller"]
const DOMAINS = ["example.com", "techcorp.io", "globalfinance.org", "enterprise.net", "datalake.dev", "cloudscale.ai"]
const CITIES = ["New York", "San Francisco", "London", "Tokyo", "Berlin", "Singapore", "Toronto", "Sydney", "Mumbai", "Paris", "Austin", "Chicago", "Amsterdam", "Dubai"]
const COUNTRIES = ["United States", "United Kingdom", "Germany", "Japan", "Singapore", "Canada", "Australia", "India", "France", "Netherlands"]
const INDUSTRIES = ["Financial Services", "Healthcare", "Cloud SaaS", "E-Commerce", "Logistics & Supply Chain", "Artificial Intelligence", "Renewable Energy", "Cybersecurity", "Telecommunications", "Automotive"]
const PRODUCTS = ["Enterprise Cloud Server", "PostgreSQL High-Availability Cluster", "Data Analytics Suite", "Real-Time Event Streamer", "Zero-Trust Security Gateway", "AI Inference Engine", "ETL Pipeline Orchestrator", "Managed Redis Cache", "Kubernetes Ingress Controller", "API Rate Limiter"]
const CATEGORIES = ["Infrastructure", "Data Management", "Security", "Analytics", "Developer Tools", "Networking"]
const PAYMENT_METHODS = ["CREDIT_CARD", "ACH_TRANSFER", "WIRE_TRANSFER", "CRYPTO", "INVOICE_NET30"]
const ORDER_STATUSES = ["COMPLETED", "PROCESSING", "PENDING_PAYMENT", "SHIPPED", "REFUNDED", "CANCELLED"]
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"]
const ENDPOINTS = ["/api/v1/auth/login", "/api/v1/users/profile", "/api/v1/orders/checkout", "/api/v1/datasets/query", "/api/v1/schemas/diff", "/api/v1/healthz", "/api/v1/webhooks/stripe"]
const LOG_LEVELS = ["INFO", "WARN", "ERROR", "DEBUG"]

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomFloat(min: number, max: number, decimals: number = 2): number {
  const str = (Math.random() * (max - min) + min).toFixed(decimals)
  return parseFloat(str)
}

function getRandomDate(startYear: number = 2023): string {
  const date = new Date(startYear, getRandomInt(0, 11), getRandomInt(1, 28), getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59))
  return date.toISOString().replace("T", " ").substring(0, 19)
}

export default function TestDataGeneratorPage() {
  const navigate = useNavigate()
  const [entityType, setEntityType] = useState<EntityType>("users")
  const [rowCount, setRowCount] = useState<number>(50)
  const [searchTerm, setSearchTerm] = useState("")
  const [outputFormat, setOutputFormat] = useState<"table" | "json" | "sql" | "csv">("table")
  const [tableName, setTableName] = useState("synthetic_test_data")
  const [copied, setCopied] = useState(false)
  const [generationSeed, setGenerationSeed] = useState(1)

  // Generate synthetic records
  const generatedRecords = useMemo(() => {
    // Seed dependency to trigger re-generation
    const _ = generationSeed
    const records: Record<string, any>[] = []

    for (let i = 1; i <= rowCount; i++) {
      if (entityType === "users") {
        const first = getRandomItem(FIRST_NAMES)
        const last = getRandomItem(LAST_NAMES)
        const domain = getRandomItem(DOMAINS)
        records.push({
          user_id: 1000 + i,
          first_name: first,
          last_name: last,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
          age: getRandomInt(21, 65),
          city: getRandomItem(CITIES),
          country: getRandomItem(COUNTRIES),
          account_balance: getRandomFloat(150, 45000),
          is_active: Math.random() > 0.15 ? 1 : 0,
          created_at: getRandomDate(2022),
        })
      } else if (entityType === "orders") {
        const product = getRandomItem(PRODUCTS)
        const unitPrice = getRandomFloat(49, 1200)
        const quantity = getRandomInt(1, 10)
        records.push({
          order_id: 50000 + i,
          customer_id: getRandomInt(1001, 1200),
          product_name: product,
          category: getRandomItem(CATEGORIES),
          unit_price: unitPrice,
          quantity: quantity,
          total_amount: parseFloat((unitPrice * quantity).toFixed(2)),
          payment_method: getRandomItem(PAYMENT_METHODS),
          status: getRandomItem(ORDER_STATUSES),
          ordered_at: getRandomDate(2024),
        })
      } else if (entityType === "companies") {
        const name = `${getRandomItem(LAST_NAMES)} & ${getRandomItem(LAST_NAMES)} ${getRandomItem(["Technologies", "Data Systems", "Holdings", "Global", "Solutions"])}`
        records.push({
          company_id: 300 + i,
          company_name: name,
          industry: getRandomItem(INDUSTRIES),
          headquarters: `${getRandomItem(CITIES)}, ${getRandomItem(COUNTRIES)}`,
          annual_revenue_usd: getRandomInt(500000, 75000000),
          employee_count: getRandomInt(15, 3500),
          founded_year: getRandomInt(1995, 2023),
          is_public: Math.random() > 0.7 ? 1 : 0,
        })
      } else if (entityType === "financial_ledger") {
        const isCredit = Math.random() > 0.5
        const amount = getRandomFloat(25, 15000)
        records.push({
          transaction_id: `TXN-${100000 + i}`,
          account_number: `ACC-00${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
          transaction_type: isCredit ? "CREDIT" : "DEBIT",
          currency: getRandomItem(["USD", "EUR", "GBP", "CAD", "JPY", "INR"]),
          amount: amount,
          fee_amount: parseFloat((amount * 0.015).toFixed(2)),
          status: getRandomItem(["SETTLED", "PENDING", "CLEARED"]),
          effective_date: getRandomDate(2024),
        })
      } else if (entityType === "server_logs") {
        const method = getRandomItem(HTTP_METHODS)
        const status = getRandomItem([200, 200, 200, 201, 204, 400, 401, 404, 500, 502])
        records.push({
          log_id: i,
          client_ip: `${getRandomInt(10, 192)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(1, 254)}`,
          http_method: method,
          endpoint: getRandomItem(ENDPOINTS),
          status_code: status,
          latency_ms: getRandomInt(12, 1450),
          log_level: status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO",
          timestamp: getRandomDate(2026),
        })
      }
    }

    return records
  }, [entityType, rowCount, generationSeed])

  // Filtered records for table preview
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return generatedRecords
    const term = searchTerm.toLowerCase()
    return generatedRecords.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    )
  }, [generatedRecords, searchTerm])

  const columnHeaders = useMemo(() => {
    if (generatedRecords.length === 0) return []
    return Object.keys(generatedRecords[0])
  }, [generatedRecords])

  // Format conversions
  const jsonOutput = useMemo(() => {
    return JSON.stringify(generatedRecords, null, 2)
  }, [generatedRecords])

  const csvOutput = useMemo(() => {
    if (generatedRecords.length === 0) return ""
    const headers = Object.keys(generatedRecords[0]).join(",")
    const rows = generatedRecords.map((row) =>
      Object.values(row)
        .map((val) => (typeof val === "string" && val.includes(",") ? `"${val}"` : String(val)))
        .join(",")
    )
    return [headers, ...rows].join("\n")
  }, [generatedRecords])

  const sqlOutput = useMemo(() => {
    if (generatedRecords.length === 0) return ""
    const firstRow = generatedRecords[0]
    const cols = Object.keys(firstRow)

    const typeMapping: Record<string, string> = {}
    cols.forEach((col) => {
      const val = firstRow[col]
      if (typeof val === "number") {
        typeMapping[col] = Number.isInteger(val) ? "INTEGER" : "DECIMAL(12,2)"
      } else {
        typeMapping[col] = col.includes("_at") || col.includes("timestamp") || col.includes("_date") ? "TIMESTAMP" : "VARCHAR(255)"
      }
    })

    let sql = `-- ==========================================================================\n`
    sql += `-- Synthetic Test Dataset: ${entityType.toUpperCase()} (${generatedRecords.length} Rows)\n`
    sql += `-- Generated on: ${new Date().toISOString()}\n`
    sql += `-- ==========================================================================\n\n`
    sql += `DROP TABLE IF EXISTS ${tableName};\n\n`
    sql += `CREATE TABLE ${tableName} (\n`
    sql += cols.map((col, idx) => `  ${col.padEnd(22)} ${typeMapping[col]}${idx === 0 ? " PRIMARY KEY" : ""}`).join(",\n")
    sql += `\n);\n\n`

    sql += `-- Insert Data Batch (${generatedRecords.length} rows)\n`
    sql += `INSERT INTO ${tableName} (${cols.join(", ")})\nVALUES\n`
    const valueTuples = generatedRecords.map((row) => {
      const vals = cols.map((col) => {
        const val = row[col]
        if (val === null || val === undefined) return "NULL"
        if (typeof val === "number") return val
        return `'${String(val).replace(/'/g, "''")}'`
      })
      return `  (${vals.join(", ")})`
    })

    sql += valueTuples.join(",\n") + `;\n\n`
    sql += `-- Verification Query\nSELECT * FROM ${tableName} LIMIT 10;\n`

    return sql
  }, [generatedRecords, tableName, entityType])

  const handleDownload = (format: "csv" | "json" | "sql") => {
    let content = ""
    let mime = "text/plain"
    let filename = `${tableName}.${format}`

    if (format === "csv") {
      content = csvOutput
      mime = "text/csv"
    } else if (format === "json") {
      content = jsonOutput
      mime = "application/json"
    } else if (format === "sql") {
      content = sqlOutput
      mime = "application/sql"
    }

    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    const text = outputFormat === "json" ? jsonOutput : outputFormat === "sql" ? sqlOutput : csvOutput
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Faker & Synthetic Data Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Synthetic Mock Data Generator</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Generate high-speed, realistic relational test datasets (Users, Orders, Companies, Financial Ledgers, Server Logs). Export instantly to CSV, JSON, or executable SQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setGenerationSeed((prev) => prev + 1)}
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Regenerate Dataset</span>
          </Button>

          <Button
            onClick={() => navigate("/sql-sandbox")}
            className="bg-white text-black hover:bg-white/90 text-xs font-medium shadow-md"
          >
            <Terminal className="h-3.5 w-3.5 mr-1.5" />
            <span>Open in SQL WASM Sandbox</span>
          </Button>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Entity Type Selector */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono text-white/60 uppercase">1. Dataset Entity</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={entityType}
              onChange={(e) => {
                const val = e.target.value as EntityType
                setEntityType(val)
                setTableName(val)
              }}
              className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-white/40"
            >
              <option value="users">👤 Users & Customer Accounts</option>
              <option value="orders">🛒 E-Commerce Orders & Transactions</option>
              <option value="companies">🏢 Enterprise Companies & B2B</option>
              <option value="financial_ledger">💳 Financial Ledger & Payments</option>
              <option value="server_logs">🖥️ HTTP Server & Access Logs</option>
            </select>
          </CardContent>
        </Card>

        {/* Row Count Slider */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-mono text-white/60 uppercase">2. Row Volume</CardTitle>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              {rowCount} Rows
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>10</span>
              <span>250</span>
              <span>500</span>
              <span>1,000</span>
            </div>
          </CardContent>
        </Card>

        {/* Table Name */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono text-white/60 uppercase">3. Target Table Name</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
              placeholder="synthetic_table"
              className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/40"
            />
          </CardContent>
        </Card>

        {/* Export CTA Card */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono text-white/60 uppercase">4. Quick Export</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button size="sm" onClick={() => handleDownload("csv")} variant="outline" className="flex-1 text-xs border-white/20 bg-white/5">
              CSV
            </Button>
            <Button size="sm" onClick={() => handleDownload("json")} variant="outline" className="flex-1 text-xs border-white/20 bg-white/5">
              JSON
            </Button>
            <Button size="sm" onClick={() => handleDownload("sql")} className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
              SQL
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace: Format Tabs & Output */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
          {/* Format Tabs */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setOutputFormat("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                outputFormat === "table" ? "bg-white text-black font-bold shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table Grid View</span>
            </button>
            <button
              onClick={() => setOutputFormat("sql")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                outputFormat === "sql" ? "bg-emerald-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>SQL DDL & Inserts</span>
            </button>
            <button
              onClick={() => setOutputFormat("json")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                outputFormat === "json" ? "bg-sky-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>JSON Array</span>
            </button>
            <button
              onClick={() => setOutputFormat("csv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                outputFormat === "csv" ? "bg-amber-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Raw CSV</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {outputFormat === "table" && (
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter rows..."
                  className="bg-[#0a0a0a] border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 w-48"
                />
              </div>
            )}

            <Button size="sm" onClick={handleCopy} className="bg-white text-black hover:bg-white/90 text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1.5">{copied ? "Copied!" : "Copy to Clipboard"}</span>
            </Button>
          </div>
        </div>

        {/* View 1: Interactive Table View */}
        {outputFormat === "table" && (
          <div className="border border-white/15 rounded-xl overflow-hidden bg-white/5 backdrop-blur-md">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#121212] border-b border-white/15 text-white/70 font-mono text-[11px] uppercase tracking-wider z-10">
                  <tr>
                    <th className="p-3 border-r border-white/10 w-12 text-center text-white/40">#</th>
                    {columnHeaders.map((col) => (
                      <th key={col} className="p-3 border-r border-white/10 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  {filteredRecords.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 border-r border-white/10 text-center text-white/40 text-[10px]">
                        {idx + 1}
                      </td>
                      {columnHeaders.map((col) => (
                        <td key={col} className="p-3 border-r border-white/10 whitespace-nowrap text-white/90">
                          {typeof row[col] === "boolean" || col === "is_active" || col === "is_public" ? (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                row[col] === 1 || row[col] === true
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                              }`}
                            >
                              {row[col] ? "TRUE" : "FALSE"}
                            </Badge>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-white/10 bg-[#0a0a0a]/60 flex items-center justify-between text-xs font-mono text-white/50">
              <span>
                Showing {filteredRecords.length} of {generatedRecords.length} generated rows
              </span>
              <span>Entity: {entityType.toUpperCase()} • 100% In-Browser</span>
            </div>
          </div>
        )}

        {/* View 2: SQL Editor */}
        {outputFormat === "sql" && (
          <div className="border border-white/15 rounded-xl overflow-hidden bg-[#0a0a0a]">
            <Editor height="500px" defaultLanguage="sql" theme="vs-dark" value={sqlOutput} options={{ readOnly: true }} />
          </div>
        )}

        {/* View 3: JSON Editor */}
        {outputFormat === "json" && (
          <div className="border border-white/15 rounded-xl overflow-hidden bg-[#0a0a0a]">
            <Editor height="500px" defaultLanguage="json" theme="vs-dark" value={jsonOutput} options={{ readOnly: true }} />
          </div>
        )}

        {/* View 4: CSV Editor */}
        {outputFormat === "csv" && (
          <div className="border border-white/15 rounded-xl overflow-hidden bg-[#0a0a0a]">
            <Editor height="500px" defaultLanguage="plaintext" theme="vs-dark" value={csvOutput} options={{ readOnly: true }} />
          </div>
        )}
      </div>
    </div>
  )
}
