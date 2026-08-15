import { useState, useEffect, useMemo } from "react"
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
  Globe,
  ShoppingBag,
  Users,
  Building,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

type DataSource = "local_generator" | "dummyjson" | "randomuser" | "countries"
type EntityType = "users" | "orders" | "companies" | "financial_ledger" | "server_logs"
type DummyResourceType = "products" | "carts" | "recipes" | "posts"

// In-browser high-speed generator dictionaries for guaranteed 100% uptime & zero network lag
const FIRST_NAMES = ["James", "Emma", "Liam", "Olivia", "Noah", "Sophia", "Lucas", "Ava", "Mason", "Isabella", "Ethan", "Mia", "Oliver", "Harper", "Aiden", "Evelyn", "Priya", "Rahul", "Chen", "Mei", "Carlos", "Elena", "Yuki", "Kenji", "Fatima", "Tariq"]
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Patel", "Sharma", "Wang", "Zhang", "Tanaka", "Sato", "Al-Mansoor", "Khan", "Dubois", "Müller"]
const DOMAINS = ["example.com", "techcorp.io", "globalfinance.org", "enterprise.net", "datalake.dev", "cloudscale.ai"]
const CITIES = ["New York", "San Francisco", "London", "Tokyo", "Berlin", "Singapore", "Toronto", "Sydney", "Mumbai", "Paris", "Austin", "Chicago", "Amsterdam", "Dubai"]
const COUNTRIES_LIST = ["United States", "United Kingdom", "Germany", "Japan", "Singapore", "Canada", "Australia", "India", "France", "Netherlands"]
const INDUSTRIES = ["Financial Services", "Healthcare", "Cloud SaaS", "E-Commerce", "Logistics & Supply Chain", "Artificial Intelligence", "Renewable Energy", "Cybersecurity", "Telecommunications", "Automotive"]
const PRODUCTS = ["Enterprise Cloud Server", "PostgreSQL High-Availability Cluster", "Data Analytics Suite", "Real-Time Event Streamer", "Zero-Trust Security Gateway", "AI Inference Engine", "ETL Pipeline Orchestrator", "Managed Redis Cache", "Kubernetes Ingress Controller", "API Rate Limiter"]
const CATEGORIES = ["Infrastructure", "Data Management", "Security", "Analytics", "Developer Tools", "Networking"]
const PAYMENT_METHODS = ["CREDIT_CARD", "ACH_TRANSFER", "WIRE_TRANSFER", "CRYPTO", "INVOICE_NET30"]
const ORDER_STATUSES = ["COMPLETED", "PROCESSING", "PENDING_PAYMENT", "SHIPPED", "REFUNDED", "CANCELLED"]
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"]
const ENDPOINTS = ["/api/v1/auth/login", "/api/v1/users/profile", "/api/v1/orders/checkout", "/api/v1/datasets/query", "/api/v1/schemas/diff", "/api/v1/healthz", "/api/v1/webhooks/stripe"]

// Comprehensive ISO Country & Geography Reference Dataset
const ISO_COUNTRIES_DATA: Record<string, any>[] = [
  { country_id: 1, iso2: "US", iso3: "USA", country_name: "United States", continent: "North America", capital: "Washington, D.C.", currency_code: "USD", phone_code: "+1", population: 334914895 },
  { country_id: 2, iso2: "GB", iso3: "GBR", country_name: "United Kingdom", continent: "Europe", capital: "London", currency_code: "GBP", phone_code: "+44", population: 67736802 },
  { country_id: 3, iso2: "DE", iso3: "DEU", country_name: "Germany", continent: "Europe", capital: "Berlin", currency_code: "EUR", phone_code: "+49", population: 83294633 },
  { country_id: 4, iso2: "JP", iso3: "JPN", country_name: "Japan", continent: "Asia", capital: "Tokyo", currency_code: "JPY", phone_code: "+81", population: 124516650 },
  { country_id: 5, iso2: "IN", iso3: "IND", country_name: "India", continent: "Asia", capital: "New Delhi", currency_code: "INR", phone_code: "+91", population: 1428627663 },
  { country_id: 6, iso2: "CA", iso3: "CAN", country_name: "Canada", continent: "North America", capital: "Ottawa", currency_code: "CAD", phone_code: "+1", population: 38781291 },
  { country_id: 7, iso2: "AU", iso3: "AUS", country_name: "Australia", continent: "Oceania", capital: "Canberra", currency_code: "AUD", phone_code: "+61", population: 26439111 },
  { country_id: 8, iso2: "SG", iso3: "SGP", country_name: "Singapore", continent: "Asia", capital: "Singapore", currency_code: "SGD", phone_code: "+65", population: 5917600 },
  { country_id: 9, iso2: "FR", iso3: "FRA", country_name: "France", continent: "Europe", capital: "Paris", currency_code: "EUR", phone_code: "+33", population: 68070697 },
  { country_id: 10, iso2: "CH", iso3: "CHE", country_name: "Switzerland", continent: "Europe", capital: "Bern", currency_code: "CHF", phone_code: "+41", population: 8796669 },
  { country_id: 11, iso2: "NL", iso3: "NLD", country_name: "Netherlands", continent: "Europe", capital: "Amsterdam", currency_code: "EUR", phone_code: "+31", population: 17700982 },
  { country_id: 12, iso2: "BR", iso3: "BRA", country_name: "Brazil", continent: "South America", capital: "Brasília", currency_code: "BRL", phone_code: "+55", population: 215313498 },
  { country_id: 13, iso2: "AE", iso3: "ARE", country_name: "United Arab Emirates", continent: "Asia", capital: "Abu Dhabi", currency_code: "AED", phone_code: "+971", population: 9441129 },
  { country_id: 14, iso2: "KR", iso3: "KOR", country_name: "South Korea", continent: "Asia", capital: "Seoul", currency_code: "KRW", phone_code: "+82", population: 51784059 },
  { country_id: 15, iso2: "SE", iso3: "SWE", country_name: "Sweden", continent: "Europe", capital: "Stockholm", currency_code: "SEK", phone_code: "+46", population: 10486941 },
]

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
  const [dataSource, setDataSource] = useState<DataSource>("local_generator")
  const [entityType, setEntityType] = useState<EntityType>("users")
  const [dummyResource, setDummyResource] = useState<DummyResourceType>("products")
  const [randomUserSeed, setRandomUserSeed] = useState("datamaster")
  const [rowCount, setRowCount] = useState<number>(50)
  const [searchTerm, setSearchTerm] = useState("")
  const [outputFormat, setOutputFormat] = useState<"table" | "json" | "sql" | "csv">("table")
  const [tableName, setTableName] = useState("synthetic_test_data")
  const [copied, setCopied] = useState(false)
  const [generationSeed, setGenerationSeed] = useState(1)

  // Remote API State
  const [remoteRecords, setRemoteRecords] = useState<Record<string, any>[]>([])
  const [loadingRemote, setLoadingRemote] = useState(false)

  // Fetch Remote API records when DummyJSON or RandomUser.me is active
  useEffect(() => {
    if (dataSource === "dummyjson") {
      setLoadingRemote(true)
      fetch(`https://dummyjson.com/${dummyResource}?limit=${Math.min(rowCount, 100)}`)
        .then((res) => res.json())
        .then((data) => {
          const list = data[dummyResource] || []
          // Flatten nested fields for clean tabular rendering
          const flattened = list.map((item: any) => {
            const flat: Record<string, any> = {}
            Object.entries(item).forEach(([k, v]) => {
              if (typeof v === "object" && v !== null) {
                flat[k] = JSON.stringify(v)
              } else {
                flat[k] = v
              }
            })
            return flat
          })
          setRemoteRecords(flattened)
          setTableName(`dummyjson_${dummyResource}`)
          setLoadingRemote(false)
        })
        .catch(() => {
          setLoadingRemote(false)
        })
    } else if (dataSource === "randomuser") {
      setLoadingRemote(true)
      fetch(`https://randomuser.me/api/?results=${Math.min(rowCount, 100)}&seed=${randomUserSeed}`)
        .then((res) => res.json())
        .then((data) => {
          const users = (data.results || []).map((u: any, idx: number) => ({
            user_id: 1000 + idx + 1,
            first_name: u.name?.first || "",
            last_name: u.name?.last || "",
            gender: u.gender || "",
            email: u.email || "",
            phone: u.phone || "",
            city: u.location?.city || "",
            state: u.location?.state || "",
            country: u.location?.country || "",
            postcode: String(u.location?.postcode || ""),
            latitude: u.location?.coordinates?.latitude || "",
            longitude: u.location?.coordinates?.longitude || "",
            registered_age: u.registered?.age || 0,
            nationality: u.nat || "",
          }))
          setRemoteRecords(users)
          setTableName("randomuser_demographics")
          setLoadingRemote(false)
        })
        .catch(() => {
          setLoadingRemote(false)
        })
    }
  }, [dataSource, dummyResource, randomUserSeed, rowCount, generationSeed])

  // Active records: local generator, remote API, or countries
  const activeRecords = useMemo(() => {
    if (dataSource === "dummyjson" || dataSource === "randomuser") {
      return remoteRecords.length > 0 ? remoteRecords : []
    }

    if (dataSource === "countries") {
      return ISO_COUNTRIES_DATA
    }

    // Local Generator
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
          country: getRandomItem(COUNTRIES_LIST),
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
          headquarters: `${getRandomItem(CITIES)}, ${getRandomItem(COUNTRIES_LIST)}`,
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
  }, [dataSource, remoteRecords, entityType, rowCount, generationSeed])

  // Filtered records for table preview
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return activeRecords
    const term = searchTerm.toLowerCase()
    return activeRecords.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(term))
    )
  }, [activeRecords, searchTerm])

  const columnHeaders = useMemo(() => {
    if (activeRecords.length === 0) return []
    return Object.keys(activeRecords[0])
  }, [activeRecords])

  // Format conversions
  const jsonOutput = useMemo(() => {
    return JSON.stringify(activeRecords, null, 2)
  }, [activeRecords])

  const csvOutput = useMemo(() => {
    if (activeRecords.length === 0) return ""
    const headers = Object.keys(activeRecords[0]).join(",")
    const rows = activeRecords.map((row) =>
      Object.values(row)
        .map((val) => (typeof val === "string" && val.includes(",") ? `"${val.replace(/"/g, '""')}"` : String(val)))
        .join(",")
    )
    return [headers, ...rows].join("\n")
  }, [activeRecords])

  const sqlOutput = useMemo(() => {
    if (activeRecords.length === 0) return ""
    const firstRow = activeRecords[0]
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
    sql += `-- Dataset: ${tableName.toUpperCase()} (${activeRecords.length} Rows)\n`
    sql += `-- Source : ${dataSource.toUpperCase()}\n`
    sql += `-- Generated on: ${new Date().toISOString()}\n`
    sql += `-- ==========================================================================\n\n`
    sql += `DROP TABLE IF EXISTS ${tableName};\n\n`
    sql += `CREATE TABLE ${tableName} (\n`
    sql += cols.map((col, idx) => `  ${col.padEnd(22)} ${typeMapping[col]}${idx === 0 ? " PRIMARY KEY" : ""}`).join(",\n")
    sql += `\n);\n\n`

    sql += `-- Insert Data Batch (${activeRecords.length} rows)\n`
    sql += `INSERT INTO ${tableName} (${cols.join(", ")})\nVALUES\n`
    const valueTuples = activeRecords.map((row) => {
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
  }, [activeRecords, tableName, dataSource])

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
            <span>Faker, DummyJSON, RandomUser & ISO Reference Hub</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Synthetic Mock & Test Data Generator</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Generate synthetic datasets or pull live feeds from DummyJSON, RandomUser.me, and ISO Geography dimensions. Export to CSV, JSON, or SQL tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setGenerationSeed((prev) => prev + 1)}
            disabled={loadingRemote}
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingRemote ? "animate-spin" : ""}`} />
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

      {/* Provider Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => {
            setDataSource("local_generator")
            setTableName("synthetic_test_data")
          }}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            dataSource === "local_generator" ? "bg-white text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span>1. Fast Synthetic Generator</span>
        </button>

        <button
          onClick={() => {
            setDataSource("dummyjson")
            setTableName(`dummyjson_${dummyResource}`)
          }}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            dataSource === "dummyjson" ? "bg-amber-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5 text-black" />
          <span>2. DummyJSON Live Feed</span>
        </button>

        <button
          onClick={() => {
            setDataSource("randomuser")
            setTableName("randomuser_demographics")
          }}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            dataSource === "randomuser" ? "bg-sky-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Users className="h-3.5 w-3.5 text-black" />
          <span>3. RandomUser.me Feed</span>
        </button>

        <button
          onClick={() => {
            setDataSource("countries")
            setTableName("dim_country_geography")
          }}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            dataSource === "countries" ? "bg-purple-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-black" />
          <span>4. ISO Country & Geography</span>
        </button>
      </div>

      {/* Dynamic Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Control 1: Entity / Resource Type */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono text-white/60 uppercase">1. Dataset Selection</CardTitle>
          </CardHeader>
          <CardContent>
            {dataSource === "local_generator" && (
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
            )}

            {dataSource === "dummyjson" && (
              <select
                value={dummyResource}
                onChange={(e) => {
                  const val = e.target.value as DummyResourceType
                  setDummyResource(val)
                  setTableName(`dummyjson_${val}`)
                }}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-white/40"
              >
                <option value="products">📦 Products & Inventory</option>
                <option value="carts">🛒 Shopping Carts & Items</option>
                <option value="recipes">🍲 Culinary Recipes & Ingredients</option>
                <option value="posts">📝 Articles & Blog Posts</option>
              </select>
            )}

            {dataSource === "randomuser" && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={randomUserSeed}
                  onChange={(e) => setRandomUserSeed(e.target.value)}
                  placeholder="Seed string..."
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
                <span className="text-[10px] text-white/40">Seed for reproducible data</span>
              </div>
            )}

            {dataSource === "countries" && (
              <div className="text-xs font-mono text-white/80 py-2">
                15+ Standard ISO-3166 Nations
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control 2: Row Volume */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-mono text-white/60 uppercase">2. Row Volume</CardTitle>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              {dataSource === "countries" ? activeRecords.length : rowCount} Rows
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <input
              type="range"
              min={10}
              max={dataSource === "dummyjson" || dataSource === "randomuser" ? 100 : 1000}
              step={10}
              disabled={dataSource === "countries"}
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer disabled:opacity-30"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>10</span>
              <span>{dataSource === "dummyjson" || dataSource === "randomuser" ? "50" : "500"}</span>
              <span>{dataSource === "dummyjson" || dataSource === "randomuser" ? "100" : "1,000"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Control 3: Table Name */}
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-mono text-white/60 uppercase">3. Target Table Name</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
              className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/40"
            />
          </CardContent>
        </Card>

        {/* Control 4: Export CTA */}
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

        {/* View 1: Table View */}
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
                        <td key={col} className="p-3 border-r border-white/10 whitespace-nowrap text-white/90 max-w-xs truncate">
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
                Showing {filteredRecords.length} of {activeRecords.length} records
              </span>
              <span>Source: {dataSource.toUpperCase()} • 100% In-Browser</span>
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
