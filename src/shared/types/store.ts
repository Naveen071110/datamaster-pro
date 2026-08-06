export interface QueryTab {
  id: string
  name: string
  sql: string
  result?: {
    columns: string[]
    rows: Record<string, unknown>[]
    rowCount: number
    affectedRows?: number
  }
  error?: string
  executionTimeMs?: number
  isExecuting: boolean
}

export interface QueryHistoryEntry {
  id: string
  sql: string
  executedAt: string
  executionTimeMs: number
  rowCount: number
  success: boolean
  errorMessage?: string
}

export interface Bookmark {
  id: string
  type: "sql-problem" | "snippet" | "qa" | "workflow" | "troubleshooting"
  targetId: string
  title: string
  path: string
  createdAt: string
  tags?: string[]
}
