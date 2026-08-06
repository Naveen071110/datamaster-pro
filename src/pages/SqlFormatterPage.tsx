import { useState, useMemo } from "react"
import { AlignLeft, Copy, Check, Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"

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

  // Pure Client-side SQL Formatter
  const formattedSql = useMemo(() => {
    if (!rawSql.trim()) return ""

    let sql = rawSql.trim()

    // 1. Keyword capitalization
    if (uppercaseKeywords) {
      SQL_KEYWORDS.forEach((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, "gi")
        sql = sql.replace(regex, kw)
      })
    } else {
      SQL_KEYWORDS.forEach((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, "gi")
        sql = sql.replace(regex, kw.toLowerCase())
      })
    }

    // 2. Line Breaks around Clauses
    const mainClauses = [
      "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT",
      "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN", "WITH",
      "UNION", "UNION ALL"
    ]

    const spaces = " ".repeat(Number(indentSpaces))

    mainClauses.forEach((clause) => {
      const regex = new RegExp(`\\s+\\b(${clause})\\b`, uppercaseKeywords ? "g" : "gi")
      sql = sql.replace(regex, `\n$1`)
    })

    // 3. Format Sub-clauses & Commas
    sql = sql.replace(/\s*,\s*/g, `,\n${spaces}`)
    sql = sql.replace(/\s+ON\s+/gi, `\n${spaces}ON `)
    sql = sql.replace(/\s+AND\s+/gi, `\n${spaces}AND `)
    sql = sql.replace(/\s+OR\s+/gi, `\n${spaces}OR `)

    return sql
  }, [rawSql, uppercaseKeywords, indentSpaces])

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <AlignLeft className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">SQL Formatter & Query Beautifier</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Format raw SQL queries, align clauses, and standardize keyword casing across database dialects. 100% in-browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">1. Raw SQL Input</CardTitle>
            <CardDescription className="text-xs">Paste single-line or unformatted SQL statements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <textarea
              value={rawSql}
              onChange={(e) => setRawSql(e.target.value)}
              className="w-full h-72 p-3 font-mono text-xs rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
              placeholder="SELECT * FROM table..."
            />

            {/* Options */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uppercase-kw"
                  checked={uppercaseKeywords}
                  onChange={(e) => setUppercaseKeywords(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="uppercase-kw" className="text-xs cursor-pointer">
                  UPPERCASE Keywords
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Indentation:</span>
                <select
                  value={indentSpaces}
                  onChange={(e) => setIndentSpaces(e.target.value)}
                  className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">2. Formatted Output</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy SQL"}
              </Button>
            </div>
            <CardDescription className="text-xs">Standardized SQL syntax.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <pre className="w-full h-full min-h-[340px] p-4 font-mono text-xs rounded-md border border-input bg-muted/40 overflow-auto whitespace-pre-wrap leading-relaxed">
              <code>{formattedSql}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
