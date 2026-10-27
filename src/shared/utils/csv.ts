/**
 * Centralized RFC 4180-Compliant CSV Processing & Formula Injection Sanitizer
 */

/**
 * Neutralizes CSV/Spreadsheet Formula Injection (CWE-1236)
 * Prepend a single quote if the field starts with =, +, -, @, \t, \r, or |
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return ""
  let str = String(val)

  // Neutralize spreadsheet formula/DDE execution triggers (=, +, -, @, |, \t, \r)
  if (/^[=+\-@|\t\r]/.test(str)) {
    str = "'" + str
  }

  // Quote if contains commas, double quotes, or newlines
  const needsQuotes = str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")
  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Parses an individual CSV line respecting RFC 4180 quotes and escaped quotes
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip escaped quote
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

/**
 * Parses a full CSV string into sanitized headers and row records
 */
export function parseCsvText(csvText: string): {
  headers: string[]
  rows: Record<string, string>[]
  rowCount: number
} {
  const trimmed = csvText.trim()
  if (!trimmed) {
    return { headers: [], rows: [], rowCount: 0 }
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0 }
  }

  const rawHeaders = parseCsvLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, "").trim())
  const cleanHeaders = rawHeaders.map((h, i) => {
    let clean = h.toLowerCase().replace(/[^a-z0-9_]/g, "_")
    if (!clean || /^[0-9]/.test(clean)) clean = `col_${i + 1}_${clean}`
    return clean
  })

  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const rawVals = parseCsvLine(lines[i]).map((v) => v.replace(/^["']|["']$/g, "").trim())
    const rowObj: Record<string, string> = {}
    cleanHeaders.forEach((h, idx) => {
      rowObj[h] = rawVals[idx] ?? ""
    })
    rows.push(rowObj)
  }

  return { headers: cleanHeaders, rows, rowCount: rows.length }
}

/**
 * Serializes rows into an RFC 4180-safe CSV string with formula neutralization
 */
export function serializeToCsv(
  columns: string[],
  rows: Record<string, unknown>[]
): string {
  if (columns.length === 0 || rows.length === 0) return ""

  const headerRow = columns.map((c) => sanitizeCsvCell(c)).join(",")
  const dataRows = rows.map((row) =>
    columns.map((col) => sanitizeCsvCell(row[col])).join(",")
  )

  return [headerRow, ...dataRows].join("\n")
}
