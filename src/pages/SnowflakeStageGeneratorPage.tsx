import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Cloud,
  Copy,
  Check,
  Download,
  Terminal,
  Database,
  Calculator,
  FileCode,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

type StageType = "s3" | "azure" | "gcs" | "internal"
type FileFormatType = "CSV" | "PARQUET" | "JSON" | "AVRO" | "ORC"
type WarehouseSize = "X-Small" | "Small" | "Medium" | "Large" | "X-Large" | "2X-Large"

const WAREHOUSE_CREDITS: Record<WarehouseSize, number> = {
  "X-Small": 1,
  "Small": 2,
  "Medium": 4,
  "Large": 8,
  "X-Large": 16,
  "2X-Large": 32,
}

const DEFAULT_STAGE_URLS: Record<StageType, string> = {
  s3: "s3://my-enterprise-data-lake/incoming/orders/",
  azure: "azure://myaccount.blob.core.windows.net/incoming/orders/",
  gcs: "gcs://my-enterprise-gcs-bucket/incoming/orders/",
  internal: "@RAW_DB.LANDING.INTERNAL_STAGE/orders/",
}

export default function SnowflakeStageGeneratorPage() {
  const navigate = useNavigate()

  // Configuration State
  const [stageType, setStageType] = useState<StageType>("s3")
  const [databaseName, setDatabaseName] = useState("RAW_DB")
  const [schemaName, setSchemaName] = useState("LANDING")
  const [tableName, setTableName] = useState("STG_ORDERS")
  const [stageName, setStageName] = useState("S3_RAW_DATA_STAGE")
  const [cloudUrl, setCloudUrl] = useState("s3://my-enterprise-data-lake/incoming/orders/")
  const [storageIntegration, setStorageIntegration] = useState("S3_INT_PROD")
  const [fileFormat, setFileFormat] = useState<FileFormatType>("PARQUET")
  const [onError, setOnError] = useState<"CONTINUE" | "SKIP_FILE" | "ABORT_STATEMENT">("CONTINUE")
  const [includeSnowpipe, setIncludeSnowpipe] = useState(true)
  const [pipeName, setPipeName] = useState("PIPE_AUTO_INGEST_ORDERS")

  // Warehouse Cost Estimator
  const [warehouseSize, setWarehouseSize] = useState<WarehouseSize>("Small")
  const [hoursPerDay, setHoursPerDay] = useState(4)
  const [costPerCredit, setCostPerCredit] = useState(3.0) // Average Enterprise Snowflake credit price ($3.00)

  const [activeTab, setActiveTab] = useState<"sql" | "cost">("sql")
  const [copied, setCopied] = useState(false)

  const handleStageTypeChange = (type: StageType) => {
    setStageType(type)
    setCloudUrl(DEFAULT_STAGE_URLS[type])
    if (type === "internal") {
      setStorageIntegration("")
    } else if (!storageIntegration) {
      setStorageIntegration(`${type.toUpperCase()}_INT_PROD`)
    }
  }

  // Synthesize Snowflake DDL & COPY INTO commands
  const generatedSql = useMemo(() => {
    let sql = `-- ==========================================================================\n`
    sql += `-- Snowflake Cloud Stage, File Format & COPY INTO Synthesizer\n`
    sql += `-- Database: ${databaseName}.${schemaName}.${tableName}\n`
    sql += `-- Cloud Provider: ${stageType.toUpperCase()} | Format: ${fileFormat}\n`
    sql += `-- ==========================================================================\n\n`

    sql += `USE DATABASE ${databaseName};\n`
    sql += `USE SCHEMA ${schemaName};\n\n`

    sql += `-- 1. Create File Format Definition\n`
    sql += `CREATE OR REPLACE FILE FORMAT FF_${fileFormat}_FORMAT\n`
    sql += `  TYPE = '${fileFormat}'\n`
    if (fileFormat === "CSV") {
      sql += `  FIELD_DELIMITER = ','\n`
      sql += `  SKIP_HEADER = 1\n`
      sql += `  FIELD_OPTIONALLY_ENCLOSED_BY = '"'\n`
      sql += `  NULL_IF = ('NULL', 'null', '')\n`
      sql += `  EMPTY_FIELD_AS_NULL = TRUE\n`
      sql += `  TRIM_SPACE = TRUE;\n\n`
    } else if (fileFormat === "PARQUET") {
      sql += `  COMPRESSION = 'SNAPPY' -- Standard fast Parquet compression\n`
      sql += `  BINARY_AS_TEXT = FALSE;\n\n`
    } else if (fileFormat === "JSON") {
      sql += `  STRIP_OUTER_ARRAY = TRUE\n`
      sql += `  ALLOW_DUPLICATE = FALSE;\n\n`
    } else {
      sql += `  COMPRESSION = 'AUTO';\n\n`
    }

    sql += `-- 2. Create Named Stage\n`
    if (stageType === "internal") {
      sql += `CREATE OR REPLACE STAGE ${stageName}\n`
      sql += `  FILE_FORMAT = (FORMAT_NAME = 'FF_${fileFormat}_FORMAT')\n`
      sql += `  DIRECTORY = (ENABLE = TRUE);\n\n`
    } else {
      sql += `CREATE OR REPLACE STAGE ${stageName}\n`
      sql += `  URL = '${cloudUrl}'\n`
      sql += `  STORAGE_INTEGRATION = ${storageIntegration}\n`
      sql += `  FILE_FORMAT = (FORMAT_NAME = 'FF_${fileFormat}_FORMAT')\n`
      sql += `  DIRECTORY = (ENABLE = TRUE, AUTO_REFRESH = TRUE);\n\n`
    }

    sql += `-- 3. Target Raw Table DDL\n`
    if (fileFormat === "PARQUET" || fileFormat === "JSON") {
      sql += `CREATE OR REPLACE TABLE ${tableName} (\n`
      sql += `  RAW_RECORD           VARIANT,\n`
      sql += `  METADATA_FILENAME    VARCHAR(500) DEFAULT METADATA$FILENAME,\n`
      sql += `  METADATA_ROW_NUMBER  NUMBER DEFAULT METADATA$FILE_ROW_NUMBER,\n`
      sql += `  LOADED_AT            TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()\n`
      sql += `);\n\n`
    } else {
      sql += `CREATE OR REPLACE TABLE ${tableName} (\n`
      sql += `  ORDER_ID             NUMBER(38,0),\n`
      sql += `  CUSTOMER_ID          NUMBER(38,0),\n`
      sql += `  AMOUNT               NUMBER(12,2),\n`
      sql += `  STATUS               VARCHAR(50),\n`
      sql += `  ORDER_DATE           TIMESTAMP_NTZ,\n`
      sql += `  LOADED_AT            TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()\n`
      sql += `);\n\n`
    }

    sql += `-- 4. Ingestion: COPY INTO Statement\n`
    if (fileFormat === "PARQUET" || fileFormat === "JSON") {
      sql += `COPY INTO ${tableName} (RAW_RECORD, METADATA_FILENAME, METADATA_ROW_NUMBER)\n`
      sql += `FROM (\n`
      sql += `  SELECT $1, METADATA$FILENAME, METADATA$FILE_ROW_NUMBER\n`
      sql += `  FROM @${stageName}\n`
      sql += `)\n`
    } else {
      sql += `COPY INTO ${tableName}\n`
      sql += `FROM @${stageName}\n`
    }
    sql += `FILE_FORMAT = (FORMAT_NAME = 'FF_${fileFormat}_FORMAT')\n`
    sql += `ON_ERROR = '${onError}'\n`
    sql += `PURGE = FALSE -- Retain source files in cloud stage for audit\n`
    sql += `FORCE = FALSE; -- Avoid reloading already ingested files\n\n`

    if (includeSnowpipe) {
      sql += `-- 5. Continuous Ingestion: Snowpipe Auto-Ingest Definition\n`
      sql += `CREATE OR REPLACE PIPE ${pipeName}\n`
      sql += `  AUTO_INGEST = TRUE\n`
      sql += `AS\n`
      if (fileFormat === "PARQUET" || fileFormat === "JSON") {
        sql += `COPY INTO ${tableName} (RAW_RECORD, METADATA_FILENAME, METADATA_ROW_NUMBER)\n`
        sql += `FROM (\n`
        sql += `  SELECT $1, METADATA$FILENAME, METADATA$FILE_ROW_NUMBER\n`
        sql += `  FROM @${stageName}\n`
        sql += `)\n`
      } else {
        sql += `COPY INTO ${tableName}\n`
        sql += `FROM @${stageName}\n`
      }
      sql += `FILE_FORMAT = (FORMAT_NAME = 'FF_${fileFormat}_FORMAT')\n`
      sql += `ON_ERROR = '${onError}';\n\n`
      sql += `-- Check Snowpipe Status\n`
      sql += `SHOW PIPES LIKE '${pipeName}';\n`
      sql += `SELECT SYSTEM$PIPE_STATUS('${pipeName}');\n`
    }

    return sql
  }, [stageType, databaseName, schemaName, tableName, stageName, cloudUrl, storageIntegration, fileFormat, onError, includeSnowpipe, pipeName])

  // Warehouse Cost Calculations
  const costCalculation = useMemo(() => {
    const creditsPerHour = WAREHOUSE_CREDITS[warehouseSize]
    const creditsPerDay = creditsPerHour * hoursPerDay
    const creditsPerMonth = creditsPerDay * 30.5
    const monthlyCostUsd = creditsPerMonth * costPerCredit
    const annualCostUsd = monthlyCostUsd * 12

    return {
      creditsPerHour,
      creditsPerDay,
      creditsPerMonth: Math.round(creditsPerMonth),
      monthlyCostUsd: Math.round(monthlyCostUsd),
      annualCostUsd: Math.round(annualCostUsd),
    }
  }, [warehouseSize, hoursPerDay, costPerCredit])

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedSql], { type: "application/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `snowflake_ingest_${tableName.toLowerCase()}.sql`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
            <Cloud className="h-3.5 w-3.5" />
            <span>Snowflake Modern Lakehouse Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Snowflake Stage & Ingestion Synthesizer</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Generate production Snowflake External Stages (S3, Azure, GCS), File Formats, `COPY INTO` pipelines, Snowpipe definitions, and compute warehouse cost estimates.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("sql")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            activeTab === "sql" ? "bg-white text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>1. Snowflake Stage & Ingest DDL</span>
        </button>
        <button
          onClick={() => setActiveTab("cost")}
          className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            activeTab === "cost" ? "bg-sky-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
          }`}
        >
          <Calculator className="h-3.5 w-3.5" />
          <span>2. Warehouse Cost & Credit Calculator</span>
        </button>
      </div>

      {/* TAB 1: Snowflake Stage Generator */}
      {activeTab === "sql" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Column */}
          <Card className="border-white/15 bg-white/5 backdrop-blur-md space-y-4 p-5">
            <CardTitle className="text-sm font-semibold text-white">Ingestion Parameters</CardTitle>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Cloud Provider:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["s3", "azure", "gcs", "internal"] as StageType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleStageTypeChange(t)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase border transition-all ${
                        stageType === t
                          ? "border-sky-400 bg-sky-400/20 text-sky-300 font-bold"
                          : "border-white/15 bg-white/5 text-white/60"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">File Format:</label>
                <select
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value as FileFormatType)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white"
                >
                  <option value="PARQUET">PARQUET (Recommended for Lakehouse)</option>
                  <option value="CSV">CSV (Delimited Text)</option>
                  <option value="JSON">JSON (Semi-Structured)</option>
                  <option value="AVRO">AVRO (Event Streams)</option>
                  <option value="ORC">ORC (Columnar)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Database & Schema:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={databaseName}
                    onChange={(e) => setDatabaseName(e.target.value)}
                    className="bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    placeholder="RAW_DB"
                  />
                  <input
                    type="text"
                    value={schemaName}
                    onChange={(e) => setSchemaName(e.target.value)}
                    className="bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    placeholder="LANDING"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Target Table Name:</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Stage Name:</label>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                />
              </div>

              {stageType !== "internal" && (
                <div>
                  <label className="text-xs font-mono text-white/60 block mb-1">Cloud Bucket URL:</label>
                  <input
                    type="text"
                    value={cloudUrl}
                    onChange={(e) => setCloudUrl(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">ON_ERROR Policy:</label>
                <select
                  value={onError}
                  onChange={(e) => setOnError(e.target.value as any)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                >
                  <option value="CONTINUE">CONTINUE (Skip corrupted rows)</option>
                  <option value="SKIP_FILE">SKIP_FILE (Skip entire bad file)</option>
                  <option value="ABORT_STATEMENT">ABORT_STATEMENT (Fail fast)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-white/80">Include Snowpipe DDL:</span>
                <input
                  type="checkbox"
                  checked={includeSnowpipe}
                  onChange={(e) => setIncludeSnowpipe(e.target.checked)}
                  className="h-4 w-4 accent-sky-400 cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Generated SQL Editor Column */}
          <Card className="lg:col-span-2 border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-white">Generated Snowflake DDL & COPY Pipeline</CardTitle>
                <CardDescription className="text-xs text-white/60">
                  Ready to execute in Snowflake Worksheets / SnowSQL
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleDownload} className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  <span>Download .sql</span>
                </Button>
                <Button size="sm" onClick={handleCopy} className="bg-white text-black hover:bg-white/90 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="ml-1.5">{copied ? "Copied!" : "Copy SQL"}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="480px" defaultLanguage="sql" theme="vs-dark" value={generatedSql} options={{ readOnly: true }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Warehouse Cost & Credit Calculator */}
      {activeTab === "cost" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-white/15 bg-white/5 backdrop-blur-md p-5 space-y-4">
            <CardTitle className="text-sm font-semibold text-white">Compute Cluster Sizing</CardTitle>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Warehouse Size:</label>
                <select
                  value={warehouseSize}
                  onChange={(e) => setWarehouseSize(e.target.value as WarehouseSize)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white"
                >
                  {(Object.keys(WAREHOUSE_CREDITS) as WarehouseSize[]).map((size) => (
                    <option key={size} value={size}>
                      {size} ({WAREHOUSE_CREDITS[size]} Credits / hr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-white/60">Active Hours / Day:</label>
                  <span className="text-xs font-mono text-sky-400">{hoursPerDay} hrs/day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 block mb-1">Price per Credit (USD):</label>
                <input
                  type="number"
                  step="0.25"
                  value={costPerCredit}
                  onChange={(e) => setCostPerCredit(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          </Card>

          {/* Results Summary Box */}
          <Card className="lg:col-span-2 border-white/15 bg-white/5 backdrop-blur-md p-6 space-y-6">
            <CardTitle className="text-base font-semibold text-sky-400">Snowflake Compute Cost Projection</CardTitle>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-xs font-mono text-white/50">Credits / Month</div>
                <div className="text-2xl font-bold text-white">{costCalculation.creditsPerMonth.toLocaleString()}</div>
                <div className="text-[10px] text-white/40">{costCalculation.creditsPerHour} credits/hr × {hoursPerDay}h/day</div>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-1">
                <div className="text-xs font-mono text-sky-300">Estimated Monthly Cost</div>
                <div className="text-2xl font-bold text-sky-400">${costCalculation.monthlyCostUsd.toLocaleString()}</div>
                <div className="text-[10px] text-white/40">Based on ${costPerCredit.toFixed(2)}/credit</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="text-xs font-mono text-emerald-300">Annualized Run Rate</div>
                <div className="text-2xl font-bold text-emerald-400">${costCalculation.annualCostUsd.toLocaleString()}</div>
                <div className="text-[10px] text-white/40">12-Month Projection</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-2 text-xs text-white/70">
              <span className="font-bold text-white">💡 Optimization Recommendations:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>Enable <code className="text-sky-300">AUTO_SUSPEND = 60</code> (1 minute) to avoid idle credit burn.</li>
                <li>Use <code className="text-sky-300">AUTO_RESUME = TRUE</code> so warehouses only start on active queries.</li>
                <li>Group smaller files into 100MB–250MB chunks to optimize Parquet parallel load concurrency.</li>
              </ul>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
