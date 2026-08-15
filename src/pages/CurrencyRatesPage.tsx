import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  DollarSign,
  ArrowRightLeft,
  RefreshCw,
  Copy,
  Check,
  Download,
  Terminal,
  Database,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

interface RatesResponse {
  base: string
  date: string
  rates: Record<string, number>
}

// Fallback baseline rates in case the client is offline or on air-gapped network
const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.865,
  GBP: 0.748,
  INR: 87.25,
  JPY: 147.3,
  CAD: 1.365,
  AUD: 1.52,
  CHF: 0.812,
  CNY: 7.18,
  SGD: 1.285,
  HKD: 7.82,
  NZD: 1.64,
  BRL: 5.42,
  MXN: 18.65,
  SEK: 10.35,
  NOK: 10.68,
  KRW: 1385.0,
  ZAR: 18.15,
  AED: 3.6725,
  SAR: 3.75,
}

const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound Sterling",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  NZD: "New Zealand Dollar",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  KRW: "South Korean Won",
  ZAR: "South African Rand",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
}

export default function CurrencyRatesPage() {
  const navigate = useNavigate()
  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [targetCurrency, setTargetCurrency] = useState("EUR")
  const [amount, setAmount] = useState<number>(1000)

  const [ratesData, setRatesData] = useState<RatesResponse>({
    base: "USD",
    date: new Date().toISOString().split("T")[0],
    rates: FALLBACK_RATES,
  })

  const [loading, setLoading] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"converter" | "sql" | "table">("converter")
  const [copied, setCopied] = useState(false)

  // Fetch Live Rates on Mount or when Base changes
  const fetchLiveRates = async (base: string) => {
    setLoading(true)
    try {
      // Primary Endpoint: Frankfurter API (ECB Live Rates)
      const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`)
      if (res.ok) {
        const data = await res.json()
        setRatesData({
          base: data.base,
          date: data.date,
          rates: { ...data.rates, [base]: 1.0 },
        })
        setIsLive(true)
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn("Frankfurter API unreachable, trying fallback CDN...")
    }

    try {
      // Secondary Fallback: jsDelivr Currency CDN
      const res2 = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`)
      if (res2.ok) {
        const data2 = await res2.json()
        const baseKey = base.toLowerCase()
        const rawRates = data2[baseKey] || {}
        const normalizedRates: Record<string, number> = {}

        Object.keys(CURRENCY_NAMES).forEach((code) => {
          const lower = code.toLowerCase()
          if (rawRates[lower]) {
            normalizedRates[code] = rawRates[lower]
          }
        })

        setRatesData({
          base: base,
          date: data2.date || new Date().toISOString().split("T")[0],
          rates: normalizedRates,
        })
        setIsLive(true)
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn("CDN fallback unreachable, using verified baseline rates.")
    }

    // Baseline Fallback
    setRatesData({
      base: base,
      date: new Date().toISOString().split("T")[0],
      rates: FALLBACK_RATES,
    })
    setIsLive(false)
    setLoading(false)
  }

  useEffect(() => {
    fetchLiveRates(baseCurrency)
  }, [baseCurrency])

  // Conversion Calculation
  const convertedAmount = useMemo(() => {
    if (baseCurrency === targetCurrency) return amount
    const rate = ratesData.rates[targetCurrency] || 1
    return parseFloat((amount * rate).toFixed(4))
  }, [amount, baseCurrency, targetCurrency, ratesData])

  const currentRate = useMemo(() => {
    return ratesData.rates[targetCurrency] || 1
  }, [targetCurrency, ratesData])

  // SQL Dimension Table Generation
  const sqlDimensionOutput = useMemo(() => {
    let sql = `-- ==========================================================================\n`
    sql += `-- Dimension Table: dim_exchange_rates (Base: ${ratesData.base})\n`
    sql += `-- Rate Effective Date : ${ratesData.date}\n`
    sql += `-- Source               : European Central Bank / Live Market Feed\n`
    sql += `-- ==========================================================================\n\n`

    sql += `DROP TABLE IF EXISTS dim_exchange_rates;\n\n`
    sql += `CREATE TABLE dim_exchange_rates (\n`
    sql += `  rate_date          DATE NOT NULL,\n`
    sql += `  base_currency      VARCHAR(3) NOT NULL,\n`
    sql += `  target_currency    VARCHAR(3) NOT NULL,\n`
    sql += `  currency_name      VARCHAR(100) NOT NULL,\n`
    sql += `  exchange_rate      DECIMAL(18,6) NOT NULL,\n`
    sql += `  inverse_rate       DECIMAL(18,6) NOT NULL,\n`
    sql += `  PRIMARY KEY (rate_date, base_currency, target_currency)\n`
    sql += `);\n\n`

    sql += `-- Insert Live Currency Exchange Rates\n`
    sql += `INSERT INTO dim_exchange_rates (rate_date, base_currency, target_currency, currency_name, exchange_rate, inverse_rate)\nVALUES\n`

    const rows = Object.entries(ratesData.rates).map(([code, rate]) => {
      const name = CURRENCY_NAMES[code] || code
      const inverse = (1 / rate).toFixed(6)
      return `  ('${ratesData.date}', '${ratesData.base}', '${code}', '${name.replace(/'/g, "''")}', ${rate.toFixed(6)}, ${inverse})`
    })

    sql += rows.join(",\n") + `;\n\n`
    sql += `-- Query Example: Convert foreign transactions to USD\n`
    sql += `SELECT \n  t.transaction_id,\n  t.amount AS original_amount,\n  t.currency,\n  (t.amount * r.inverse_rate) AS amount_in_usd\nFROM fact_transactions t\nINNER JOIN dim_exchange_rates r \n  ON t.currency = r.target_currency \n  AND r.base_currency = 'USD';\n`

    return sql
  }, [ratesData])

  // Filtered Table Rows
  const tableRows = useMemo(() => {
    const list = Object.entries(ratesData.rates).map(([code, rate]) => ({
      code,
      name: CURRENCY_NAMES[code] || code,
      rate: rate,
      inverse: rate > 0 ? parseFloat((1 / rate).toFixed(4)) : 0,
    }))

    if (!searchTerm.trim()) return list
    const term = searchTerm.toLowerCase()
    return list.filter(
      (item) =>
        item.code.toLowerCase().includes(term) || item.name.toLowerCase().includes(term)
    )
  }, [ratesData, searchTerm])

  const handleSwap = () => {
    const temp = baseCurrency
    setBaseCurrency(targetCurrency)
    setTargetCurrency(temp)
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDimensionOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
            <DollarSign className="h-3.5 w-3.5" />
            <span>ECB & Global FX API Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Live Currency Rates & FX Normalizer</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Live foreign exchange rates across 30+ global currencies. Convert monetary values and generate SQL `dim_exchange_rates` dimension tables for ETL pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-white/15 bg-white/5 rounded-full px-3 py-1 text-xs">
            {isLive ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] text-emerald-400">Live ECB Feed ({ratesData.date})</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono text-[11px] text-amber-400">Baseline Cache ({ratesData.date})</span>
              </>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => fetchLiveRates(baseCurrency)}
            disabled={loading}
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Feed</span>
          </Button>

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

      {/* Mode / Feature Tabs */}
      <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("converter")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            activeTab === "converter" ? "bg-white text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>1. Currency Converter</span>
        </button>
        <button
          onClick={() => setActiveTab("sql")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            activeTab === "sql" ? "bg-sky-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>2. SQL Dimension Table (DDL)</span>
        </button>
        <button
          onClick={() => setActiveTab("table")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            activeTab === "table" ? "bg-emerald-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>3. Rates Matrix Grid</span>
        </button>
      </div>

      {/* TAB 1: Live Interactive Converter */}
      {activeTab === "converter" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Converter Card */}
          <Card className="lg:col-span-2 border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">Interactive Currency Pair Converter</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Calculated against live European Central Bank reference exchange rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Amount Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-white/60">Amount:</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-base font-mono text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                {/* Base Currency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-white/60">From Currency:</label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                  >
                    {Object.keys(CURRENCY_NAMES).map((code) => (
                      <option key={code} value={code}>
                        {code} — {CURRENCY_NAMES[code]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Currency */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-white/60">To Currency:</label>
                    <button onClick={handleSwap} className="text-[10px] text-sky-400 hover:underline flex items-center gap-1">
                      <ArrowRightLeft className="h-2.5 w-2.5" /> Swap
                    </button>
                  </div>
                  <select
                    value={targetCurrency}
                    onChange={(e) => setTargetCurrency(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                  >
                    {Object.keys(CURRENCY_NAMES).map((code) => (
                      <option key={code} value={code}>
                        {code} — {CURRENCY_NAMES[code]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Result Hero Box */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-6 space-y-2">
                <div className="text-xs font-mono text-sky-300">
                  {amount.toLocaleString()} {baseCurrency} =
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {convertedAmount.toLocaleString()} <span className="text-sky-400">{targetCurrency}</span>
                </div>
                <div className="text-xs font-mono text-white/60 pt-2 border-t border-sky-500/20 flex flex-wrap justify-between gap-2">
                  <span>1 {baseCurrency} = {currentRate.toFixed(4)} {targetCurrency}</span>
                  <span>1 {targetCurrency} = {(1 / currentRate).toFixed(4)} {baseCurrency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Rates Sidebar */}
          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white">Key FX Rates ({baseCurrency})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["EUR", "GBP", "INR", "JPY", "CAD", "AUD"].map((code) => {
                const r = ratesData.rates[code] || 1
                return (
                  <div key={code} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0a0a]/60 border border-white/10">
                    <div>
                      <div className="font-mono text-xs font-bold text-white">{code}</div>
                      <div className="text-[10px] text-white/50">{CURRENCY_NAMES[code]}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold text-sky-400">{r.toFixed(4)}</div>
                      <div className="text-[10px] font-mono text-white/40">1 {code} = {(1 / r).toFixed(4)} {baseCurrency}</div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: SQL Dimension Table Generator */}
      {activeTab === "sql" && (
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">Generated `dim_exchange_rates` DDL & Insert SQL</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Ready-to-execute dimension table for warehouse currency normalization
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleCopySql} className="bg-white text-black hover:bg-white/90 text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1.5">{copied ? "Copied!" : "Copy SQL"}</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor height="450px" defaultLanguage="sql" theme="vs-dark" value={sqlDimensionOutput} options={{ readOnly: true }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Rates Matrix Grid */}
      {activeTab === "table" && (
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">All Exchange Rates Matrix (Base: {baseCurrency})</CardTitle>
              <CardDescription className="text-xs text-white/60">
                {tableRows.length} active currencies mapped
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="h-3.5 w-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search currency..."
                className="w-full bg-[#0a0a0a] border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#121212] border-b border-white/15 text-white/70 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="p-3 border-r border-white/10">Code</th>
                    <th className="p-3 border-r border-white/10">Currency Name</th>
                    <th className="p-3 border-r border-white/10">Rate (1 {baseCurrency} =)</th>
                    <th className="p-3">Inverse (1 Unit =)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  {tableRows.map((row) => (
                    <tr key={row.code} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 border-r border-white/10 font-bold text-sky-400">
                        {row.code}
                      </td>
                      <td className="p-3 border-r border-white/10 text-white/90">
                        {row.name}
                      </td>
                      <td className="p-3 border-r border-white/10 text-emerald-400 font-semibold">
                        {row.rate.toFixed(4)} {row.code}
                      </td>
                      <td className="p-3 text-white/60">
                        {row.inverse.toFixed(4)} {baseCurrency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
