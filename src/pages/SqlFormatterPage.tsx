import { useState, useMemo } from "react"
import { Copy, Check, RotateCcw } from "lucide-react"

const SAMPLE_UNFORMATTED_SQL = `select e.id, e.first_name, e.last_name, d.department_name, sum(s.salary_amount) as total_earned from employees e join departments d on e.department_id = d.id join salaries s on e.id = s.employee_id where e.is_active = true and s.payment_date >= '2023-01-01' group by e.id, e.first_name, e.last_name, d.department_name having sum(s.salary_amount) > 50000 order by total_earned desc limit 50;`

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT",
  "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN", "CROSS JOIN",
  "ON", "AND", "OR", "IN", "NOT IN", "EXISTS", "BETWEEN", "LIKE", "ILIKE",
  "AS", "CASE", "WHEN", "THEN", "ELSE", "END", "UNION", "UNION ALL", "WITH",
  "CREATE TABLE", "DROP TABLE", "INSERT INTO", "UPDATE", "DELETE FROM", "ALTER TABLE",
  "SUM", "COUNT", "AVG", "MIN", "MAX", "COALESCE", "ROW_NUMBER", "OVER", "PARTITION BY"
]

export default function SqlFormatterPage() {
  const [rawSql, setRawSql] = useState(SAMPLE_UNFORMATTED_SQL)
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true)
  const [indentSpaces, setIndentSpaces] = useState("2")
  const [copied, setCopied] = useState(false)

  // Pure Client-side SQL Formatter with string literal shielding
  const formattedSql = useMemo(() => {
    if (!rawSql.trim()) return ""

    // 1. Shield string literals
    const strings: string[] = []
    let sql = rawSql.replace(/'(?:''|[^'])*'/g, (match) => {
      strings.push(match)
      return `__STR_LITERAL_${strings.length - 1}__`
    })

    // 2. Keyword capitalization
    SQL_KEYWORDS.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi")
      sql = sql.replace(regex, uppercaseKeywords ? kw : kw.toLowerCase())
    })

    // 3. Line Breaks around Clauses
    const mainClauses = [
      "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT",
      "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN", "WITH",
      "UNION", "UNION ALL"
    ]

    const spaces = " ".repeat(Number(indentSpaces))

    mainClauses.forEach((clause) => {
      const regex = new RegExp(`\\s+\\b(${clause})\\b`, "gi")
      sql = sql.replace(regex, `\n$1`)
    })

    // 4. Format Sub-clauses & Commas (at top-level parenthesis depth 0)
    let formattedWithCommas = ""
    let depth = 0
    for (let i = 0; i < sql.length; i++) {
      const char = sql[i]
      if (char === "(") depth++
      else if (char === ")") depth = Math.max(0, depth - 1)

      if (char === "," && depth === 0) {
        formattedWithCommas += `,\n${spaces}`
        while (sql[i + 1] === " " || sql[i + 1] === "\t") i++
      } else {
        formattedWithCommas += char
      }
    }
    sql = formattedWithCommas

    sql = sql.replace(/\s+ON\s+/gi, `\n${spaces}ON `)
    sql = sql.replace(/\s+AND\s+/gi, `\n${spaces}AND `)
    sql = sql.replace(/\s+OR\s+/gi, `\n${spaces}OR `)

    // 5. Restore string literals using a function replacer to shield '$' tokens
    strings.forEach((str, idx) => {
      sql = sql.replace(`__STR_LITERAL_${idx}__`, () => str)
    })

    return sql
  }, [rawSql, uppercaseKeywords, indentSpaces])

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSql).catch(() => {})
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
              Syntax Beautifier
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 border border-white/15 bg-white/5 px-2.5 py-1 rounded-full">
            100% In-Browser
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-normal tracking-tight text-white">
          SQL Query Formatter & Alignment Engine
        </h1>
        <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
          Standardize unformatted SQL queries, align clauses, and format keyword casing (UPPERCASE vs lowercase) with custom indentation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 space-y-3 flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white">1. Raw SQL Input</h2>
            <button
              type="button"
              onClick={() => setRawSql("")}
              className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>
          <p className="text-xs text-white/60">Paste single-line or unformatted SQL statements.</p>
          <textarea
            id="raw-sql-input"
            aria-label="Raw SQL Input"
            value={rawSql}
            onChange={(e) => setRawSql(e.target.value)}
            className="w-full h-72 p-3 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white resize-none focus:outline-none focus:ring-1 focus:ring-white leading-relaxed"
            placeholder="SELECT * FROM table..."
          />

          {/* Options */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="uppercase-kw"
                checked={uppercaseKeywords}
                onChange={(e) => setUppercaseKeywords(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-[#0a0a0a] text-white focus:ring-white"
              />
              <label htmlFor="uppercase-kw" className="text-xs cursor-pointer text-white/80">
                UPPERCASE Keywords
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="indent-spaces-select" className="text-xs font-medium text-white/80">Indentation:</label>
              <select
                id="indent-spaces-select"
                value={indentSpaces}
                onChange={(e) => setIndentSpaces(e.target.value)}
                className="h-8 px-2 text-xs rounded-md border border-white/20 bg-[#0a0a0a] text-white focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white">2. Formatted Output</h2>
            <button
              onClick={handleCopy}
              className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Formatted SQL"}</span>
            </button>
          </div>
          <p className="text-xs text-white/60">Standardized SQL syntax.</p>
          <pre className="w-full h-full min-h-[340px] p-4 font-mono text-xs rounded-lg border border-white/15 bg-[#0d0d0d] text-white overflow-auto whitespace-pre-wrap leading-relaxed">
            <code>{formattedSql || "-- Formatted SQL query will appear here..."}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
