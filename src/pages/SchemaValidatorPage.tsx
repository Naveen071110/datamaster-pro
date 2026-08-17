import { useState, useMemo } from "react"
import { CheckCircle, XCircle, AlertTriangle, Table2, Upload } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { EmptyState } from "@/shared/components/EmptyState"
import { cn } from "@/shared/utils/cn"
import Editor from "@monaco-editor/react"

interface FieldValidation {
  field: string
  expectedType: string
  actualType: string
  sampleValue: unknown
  passed: boolean
  error?: string
}

function inferType(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number"
  }
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return "datetime"
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date"
    return "string"
  }
  if (Array.isArray(value)) return "array"
  if (typeof value === "object") return "object"
  return typeof value
}

function validateField(
  field: string,
  schemaType: string,
  values: unknown[]
): FieldValidation {
  const actualTypes = values.map((v) => inferType(v))
  const uniqueNonNullableTypes = [...new Set(actualTypes.filter((t) => t !== "null"))]
  const displayActualType = uniqueNonNullableTypes.length > 0 ? uniqueNonNullableTypes.join(" | ") : "null"

  // Validation passes only if EVERY non-null value conforms to the expected type
  const hasTypeMismatch = uniqueNonNullableTypes.some((t) => {
    if (schemaType === "any") return false
    if (schemaType === "number" && t === "integer") return false
    return t !== schemaType
  })

  const passed = !hasTypeMismatch
  const sampleValue = values.find((v) => v !== null && v !== undefined) ?? null

  return {
    field,
    expectedType: schemaType,
    actualType: displayActualType,
    sampleValue,
    passed,
    error: passed ? undefined : `Expected ${schemaType}, found [${displayActualType}]`,
  }
}

interface SchemaSpec {
  [field: string]: string
}

function validateSchema(schema: SchemaSpec, data: Record<string, unknown>[]): FieldValidation[] {
  if (data.length === 0) return []

  const results: FieldValidation[] = []

  for (const [field, expectedType] of Object.entries(schema)) {
    const values = data.map((row) => row[field]).filter((v) => v !== undefined)
    if (values.length === 0) {
      results.push({
        field,
        expectedType,
        actualType: "missing",
        sampleValue: null,
        passed: false,
        error: `Field "${field}" not found in data`,
      })
      continue
    }
    results.push(validateField(field, expectedType, values))
  }

  // Check for extra fields in data
  const dataFields = new Set(data.flatMap((row) => Object.keys(row)))
  for (const field of dataFields) {
    if (!(field in schema)) {
      results.push({
        field,
        expectedType: "not specified",
        actualType: inferType(data[0]?.[field]),
        sampleValue: data[0]?.[field] ?? null,
        passed: true,
        error: "Extra field not in schema",
      })
    }
  }

  return results
}

const DEFAULT_EXAMPLES = [
  {
    name: "employees",
    schema: JSON.stringify({ id: "integer", name: "string", department: "string", salary: "number", hire_date: "date" }, null, 2),
    data: JSON.stringify([
      { id: 1, name: "Alice", department: "Engineering", salary: 95000, hire_date: "2020-03-15" },
      { id: 2, name: "Bob", department: "Marketing", salary: null, hire_date: "2019-07-22" },
      { id: "three", name: "Charlie", department: "Engineering", salary: 88000, hire_date: "2021-01-10" },
    ], null, 2),
  },
  {
    name: "types",
    schema: JSON.stringify({ id: "integer", amount: "number", active: "boolean", email: "string" }, null, 2),
    data: JSON.stringify([
      { id: 1, amount: 150.50, active: true, email: "user1@example.com" },
      { id: "2", amount: "200", active: "yes", email: "user2@example.com" },
    ], null, 2),
  },
]

export default function SchemaValidatorPage() {
  const [schemaText, setSchemaText] = useState("")
  const [dataText, setDataText] = useState("")
  const [validated, setValidated] = useState(false)

  const results = useMemo(() => {
    if (!schemaText.trim() || !dataText.trim()) return null
    try {
      const schema = JSON.parse(schemaText) as SchemaSpec
      const data = JSON.parse(dataText) as Record<string, unknown>[]
      const array = Array.isArray(data) ? data : [data]
      return validateSchema(schema, array)
    } catch (e) {
      return null
    }
  }, [schemaText, dataText, validated])

  const handleValidate = () => {
    setValidated(true)
  }

  const loadExample = (name: string) => {
    const example = DEFAULT_EXAMPLES.find((e) => e.name === name)
    if (example) {
      setSchemaText(example.schema)
      setDataText(example.data)
      setValidated(false)
    }
  }

  const passedCount = results?.filter((r) => r.passed).length ?? 0
  const failedCount = results?.filter((r) => !r.passed).length ?? 0

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schema Validator</h1>
        <p className="text-muted-foreground mt-1">
          Define a JSON schema and validate your data against it. Detect type mismatches and structural issues.
        </p>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground py-1">Load example:</span>
        {DEFAULT_EXAMPLES.map((ex) => (
          <Button key={ex.name} variant="outline" size="sm" className="text-xs" onClick={() => loadExample(ex.name)}>
            {ex.name}
          </Button>
        ))}
      </div>

      {/* Schema + Data input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">JSON Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-md overflow-hidden">
              <Editor
                height="200px"
                defaultLanguage="json"
                theme="vs-dark"
                value={schemaText}
                onChange={(val) => { setSchemaText(val || ""); setValidated(false) }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sample Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-md overflow-hidden">
              <Editor
                height="200px"
                defaultLanguage="json"
                theme="vs-dark"
                value={dataText}
                onChange={(val) => { setDataText(val || ""); setValidated(false) }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validate button */}
      <Button onClick={handleValidate} disabled={!schemaText.trim() || !dataText.trim()}>
        <Upload className="h-4 w-4 mr-1.5" />
        Validate
      </Button>

      {/* Results */}
      {results && validated && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {results.length} fields
            </Badge>
            <Badge variant="outline" className={cn("text-xs", failedCount === 0 ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30")}>
              {passedCount} passed
            </Badge>
            {failedCount > 0 && (
              <Badge variant="outline" className="text-xs text-red-400 border-red-500/30">
                {failedCount} failed
              </Badge>
            )}
          </div>

          {/* Results table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left">Field</th>
                      <th className="px-4 py-2 text-left">Expected Type</th>
                      <th className="px-4 py-2 text-left">Actual Type</th>
                      <th className="px-4 py-2 text-left">Sample Value</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.field} className={cn("border-t border-border/50", !r.passed && "bg-red-500/5")}>
                        <td className="px-4 py-2 font-medium">{r.field}</td>
                        <td className="px-4 py-2">
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{r.expectedType}</code>
                        </td>
                        <td className="px-4 py-2">
                          <code className={cn("text-[10px] bg-muted px-1.5 py-0.5 rounded", !r.passed && "text-red-400")}>
                            {r.actualType}
                          </code>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground max-w-[200px] truncate font-mono">
                          {JSON.stringify(r.sampleValue)}
                        </td>
                        <td className="px-4 py-2">
                          {r.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <div className="flex items-center gap-1 text-red-400">
                              <XCircle className="h-4 w-4" />
                              <span className="text-[10px]">{r.error}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* All passed message */}
          {failedCount === 0 && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">All fields validated successfully!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!validated && (
        <EmptyState
          icon={<Table2 className="h-8 w-8" />}
          title="Define schema + data"
          message="Enter a JSON schema and sample data above, then click Validate to check for type mismatches."
          action={{ label: "Load example", onClick: () => loadExample("employees") }}
        />
      )}

      {validated && !results && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">Invalid JSON. Check your schema and data formats.</span>
          </div>
        </div>
      )}
    </div>
  )
}
