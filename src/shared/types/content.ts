export interface SqlProblem {
  id: string
  title: string
  difficulty: "easy" | "medium" | "hard"
  category:
    | "basic-sql"
    | "joins"
    | "aggregation"
    | "subqueries"
    | "window-functions"
    | "cte-recursive"
    | "performance-tuning"
    | "etl-transforms"
    | "data-types"
    | "indexes"
  topic: string
  scenario: string
  problemStatement: string
  hints: string[]
  expectedResult: string
  solution: string
  solutionExplanation: string
  alternativeSolutions?: string[]
  datasetRequired: "employees" | "transactions" | "orders" | "logs" | "none"
  tags: string[]
  relatedProblems: string[]
}

export interface DecisionNode {
  id: string
  question: string
  answers: DecisionAnswer[]
}

export interface DecisionAnswer {
  id: string
  label: string
  next: DecisionNode | SolutionNode
}

export interface SolutionNode {
  id: string
  isSolution: true
  title: string
  description: string
  steps: string[]
  codeExample?: string
  preventionTips?: string[]
  relatedTrees?: string[]
}

export interface TroubleScenario {
  id: string
  title: string
  category: "connection" | "data-quality" | "performance" | "schema" | "dependency"
  description: string
  icon: string
  tree: DecisionNode
}

export interface WorkflowPreset {
  id: string
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: "batch" | "streaming" | "data-warehouse" | "data-lake" | "migration"
  tags: string[]
  nodes: WorkflowNodeDef[]
  edges: WorkflowEdgeDef[]
}

export interface WorkflowNodeDef {
  id: string
  type: "source" | "transform" | "load" | "errorHandler"
  label: string
  position: { x: number; y: number }
  config?: Record<string, unknown>
}

export interface WorkflowEdgeDef {
  id: string
  source: string
  target: string
  label?: string
  animated?: boolean
}

export interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: "sql" | "python" | "yaml" | "bash" | "json"
  tool: "sql" | "python" | "dbt" | "airflow" | "spark" | "kafka" | "snowflake" | "bigquery" | "generic-etl"
  difficulty: "beginner" | "intermediate" | "advanced"
  category: "select" | "join" | "transform" | "load" | "extract" | "data-quality" | "orchestration" | "testing"
  tags: string[]
  usage: string
  relatedSnippets: string[]
}

export interface Dataset {
  id: "employees" | "transactions" | "orders" | "logs"
  name: string
  description: string
  rowCount: number
  tables: DatasetTable[]
}

export interface DatasetTable {
  name: string
  columns: DatasetColumn[]
  rows: Record<string, unknown>[]
  createTableSql: string
  indexes?: string[]
}

export interface DatasetColumn {
  name: string
  type: "INTEGER" | "REAL" | "TEXT" | "BLOB" | "NUMERIC" | "DATE"
  nullable: boolean
  primaryKey?: boolean
  foreignKey?: { table: string; column: string }
  description?: string
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

export interface QueryTab {
  id: string
  name: string
  sql: string
  result?: QueryResult
  error?: string
  executionTimeMs?: number
  isExecuting: boolean
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  affectedRows?: number
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
