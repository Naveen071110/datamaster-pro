import { useState, useMemo } from "react"
import { FileCode2, Copy, Check, Upload, Download } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

const SAMPLE_INFORMATICA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE POWERMART SYSTEM "powrmart.dtd">
<POWERMART CREATION_DATE="08/13/2026 10:00:00" REPOSITORY_VERSION="187.93">
  <REPOSITORY NAME="REP_PROD" VERSION="187" CODEPAGE="UTF-8">
    <FOLDER NAME="FINANCE_ETL" GROUP="" OWNER="dbadmin">
      <MAPPING NAME="m_mrg_customer_sales" ISVALID="YES">
        <TRANSFORMATION NAME="SQ_CUSTOMERS" TYPE="Source Qualifier">
          <TRANSFORMFIELD NAME="CUST_ID" DATATYPE="integer" PORTTYPE="INPUT/OUTPUT"/>
          <TRANSFORMFIELD NAME="CUST_NAME" DATATYPE="string" PRECISION="100" PORTTYPE="INPUT/OUTPUT"/>
          <TRANSFORMFIELD NAME="REGION" DATATYPE="string" PRECISION="50" PORTTYPE="INPUT/OUTPUT"/>
          <TABLEATTRIBUTE NAME="Sql Query" VALUE="SELECT CUST_ID, CUST_NAME, REGION FROM PROD_DB.CUSTOMERS WHERE STATUS = '$$STATUS' AND JOIN_DATE >= '$$START_DATE'"/>
        </TRANSFORMATION>
        <TRANSFORMATION NAME="EXP_CALC_METRICS" TYPE="Expression">
          <TRANSFORMFIELD NAME="CUST_ID" DATATYPE="integer" PORTTYPE="INPUT/OUTPUT"/>
          <TRANSFORMFIELD NAME="CUST_NAME" DATATYPE="string" PRECISION="100" PORTTYPE="INPUT/OUTPUT"/>
          <TRANSFORMFIELD NAME="FULL_NAME_UPPER" DATATYPE="string" PRECISION="150" PORTTYPE="OUTPUT" EXPRESSION="UPPER(CUST_NAME)"/>
          <TRANSFORMFIELD NAME="REGION_CODE" DATATYPE="string" PRECISION="10" PORTTYPE="OUTPUT" EXPRESSION="IIF(ISNULL(REGION), 'UNK', UPPER(SUBSTR(REGION, 1, 3)))"/>
        </TRANSFORMATION>
        <TRANSFORMATION NAME="FIL_HIGH_VALUE" TYPE="Filter">
          <TRANSFORMFIELD NAME="CUST_ID" DATATYPE="integer" PORTTYPE="INPUT/OUTPUT"/>
          <TRANSFORMFIELD NAME="FULL_NAME_UPPER" DATATYPE="string" PRECISION="150" PORTTYPE="INPUT/OUTPUT"/>
          <TRANSFORMFIELD NAME="REGION_CODE" DATATYPE="string" PRECISION="10" PORTTYPE="INPUT/OUTPUT"/>
          <TABLEATTRIBUTE NAME="Filter Condition" VALUE="REGION_CODE != 'UNK'"/>
        </TRANSFORMATION>
        <TRANSFORMATION NAME="AGG_SUM_SALES" TYPE="Aggregator">
          <TRANSFORMFIELD NAME="REGION_CODE" DATATYPE="string" PRECISION="10" PORTTYPE="INPUT/OUTPUT/GROUPBY"/>
          <TRANSFORMFIELD NAME="TOTAL_CUSTOMERS" DATATYPE="integer" PORTTYPE="OUTPUT" EXPRESSION="COUNT(CUST_ID)"/>
        </TRANSFORMATION>
        <TARGETLOADORDER ORDER="1" TARGETINSTANCE="TGT_REGION_SALES_SUMMARY"/>
      </MAPPING>
    </FOLDER>
  </REPOSITORY>
</POWERMART>`

const SAMPLE_PARAMETER_FILE = `[GLOBAL]
$$START_DATE=2024-01-01
$$STATUS=ACTIVE
$$DEPT_ID=101
$$REGION=US_EAST`

const SAMPLE_PARAM_QUERY = `SELECT 
  c.CUST_ID,
  c.CUST_NAME,
  c.REGION,
  s.SALES_AMOUNT
FROM PROD_DB.CUSTOMERS c
INNER JOIN PROD_DB.SALES s ON c.CUST_ID = s.CUST_ID
WHERE c.STATUS = '$$STATUS'
  AND s.TRANSACTION_DATE >= '$$START_DATE'
  AND c.DEPT_ID = $$DEPT_ID
  AND c.REGION = '$$REGION';`

type Dialect = "postgres" | "db2" | "snowflake" | "bigquery" | "oracle"

export default function InformaticaXmlToSqlPage() {
  const [mode, setMode] = useState<"xml" | "param">("xml")
  const [xmlInput, setXmlInput] = useState(SAMPLE_INFORMATICA_XML)
  const [paramQuery, setParamQuery] = useState(SAMPLE_PARAM_QUERY)
  const [paramFileContent, setParamFileContent] = useState(SAMPLE_PARAMETER_FILE)
  const [targetDialect, setTargetDialect] = useState<Dialect>("snowflake")
  const [copied, setCopied] = useState(false)

  // Mode 1: Parse Informatica XML Mapping into executable SQL query
  const parsedXmlData = useMemo(() => {
    if (!xmlInput.trim()) {
      return { sql: "-- Paste or upload an Informatica PowerCenter XML mapping file.", mappingName: "", transformations: [] }
    }

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlInput, "text/xml")
      const parserError = doc.querySelector("parsererror")
      if (parserError) {
        return { sql: `-- XML Parsing Error: Invalid XML syntax.\n-- ${parserError.textContent?.slice(0, 150)}`, mappingName: "", transformations: [] }
      }
      const mappingNode = doc.querySelector("MAPPING")
      const mappingName = mappingNode?.getAttribute("NAME") || "m_informatica_mapping"

      const transformNodes = doc.querySelectorAll("TRANSFORMATION")
      const transformations: { name: string; type: string; details: string; fields: string[] }[] = []

      let sourceQuery = ""
      let filterCondition = ""
      let exprFields: { name: string; expr: string }[] = []
      let groupFields: string[] = []
      let aggFields: { name: string; expr: string }[] = []

      transformNodes.forEach((node) => {
        const name = node.getAttribute("NAME") || ""
        const type = node.getAttribute("TYPE") || ""
        const fieldNodes = node.querySelectorAll("TRANSFORMFIELD")
        const fieldsArr: string[] = []

        fieldNodes.forEach((f) => {
          const fName = f.getAttribute("NAME") || ""
          fieldsArr.push(fName)

          const portType = f.getAttribute("PORTTYPE") || ""
          const expr = f.getAttribute("EXPRESSION")

          if (type === "Expression" && expr) {
            exprFields.push({ name: fName, expr })
          }

          if (type === "Aggregator") {
            if (portType.includes("GROUPBY")) {
              groupFields.push(fName)
            }
            if (expr) {
              aggFields.push({ name: fName, expr })
            }
          }
        })

        if (type === "Source Qualifier") {
          const sqlAttr = node.querySelector('TABLEATTRIBUTE[NAME="Sql Query"]')
          if (sqlAttr) {
            sourceQuery = sqlAttr.getAttribute("VALUE") || ""
          }
        }

        if (type === "Filter") {
          const filterAttr = node.querySelector('TABLEATTRIBUTE[NAME="Filter Condition"]')
          if (filterAttr) {
            filterCondition = filterAttr.getAttribute("VALUE") || ""
          }
        }

        transformations.push({
          name,
          type,
          details: type === "Source Qualifier" ? sourceQuery : type === "Filter" ? filterCondition : `${fieldsArr.length} ports`,
          fields: fieldsArr,
        })
      })

      const transpileExpr = (expr: string): string => {
        let sqlExpr = expr
        sqlExpr = sqlExpr.replace(/IIF\s*\(\s*ISNULL\((.*?)\)\s*,\s*(.*?)\s*,\s*(.*?)\)/gi, "CASE WHEN $1 IS NULL THEN $2 ELSE $3 END")
        sqlExpr = sqlExpr.replace(/IIF\s*\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\)/gi, "CASE WHEN $1 THEN $2 ELSE $3 END")
        sqlExpr = sqlExpr.replace(/ISNULL\((.*?)\)/gi, "$1 IS NULL")
        sqlExpr = sqlExpr.replace(/SUBSTR\(/gi, targetDialect === "db2" || targetDialect === "oracle" ? "SUBSTR(" : "SUBSTRING(")
        return sqlExpr
      }

      let generatedSql = `-- ==========================================================================\n`
      generatedSql += `-- Informatica PowerCenter Mapping SQL Converter\n`
      generatedSql += `-- Mapping Name : ${mappingName}\n`
      generatedSql += `-- Target Dialect: ${targetDialect.toUpperCase()}\n`
      generatedSql += `-- ==========================================================================\n\n`

      generatedSql += `WITH sq_source AS (\n`
      if (sourceQuery) {
        generatedSql += `  -- Source Qualifier SQL Override\n`
        generatedSql += `  ${sourceQuery.split("\n").join("\n  ")}\n`
      } else {
        generatedSql += `  SELECT cust_id, cust_name, region FROM source_table\n`
      }
      generatedSql += `),\n\n`

      generatedSql += `exp_transform AS (\n`
      generatedSql += `  SELECT\n    CUST_ID,\n    CUST_NAME,\n`
      if (exprFields.length > 0) {
        generatedSql += exprFields.map((f) => `    ${transpileExpr(f.expr)} AS ${f.name}`).join(",\n") + `\n`
      } else {
        generatedSql += `    UPPER(CUST_NAME) AS FULL_NAME_UPPER,\n`
        generatedSql += `    CASE WHEN REGION IS NULL THEN 'UNK' ELSE UPPER(SUBSTRING(REGION, 1, 3)) END AS REGION_CODE\n`
      }
      generatedSql += `  FROM sq_source\n)`

      if (filterCondition) {
        generatedSql += `,\n\nfil_transform AS (\n  SELECT *\n  FROM exp_transform\n  WHERE ${transpileExpr(filterCondition)}\n)`
      }

      generatedSql += `\n\n-- Target Data Result Set\nSELECT\n`
      if (groupFields.length > 0) {
        generatedSql += `  ${groupFields.join(", ")},\n`
      }
      if (aggFields.length > 0) {
        generatedSql += aggFields.map((f) => `  ${transpileExpr(f.expr)} AS ${f.name}`).join(",\n") + `\n`
      } else {
        generatedSql += `  REGION_CODE,\n  COUNT(CUST_ID) AS TOTAL_CUSTOMERS\n`
      }
      generatedSql += `FROM ${filterCondition ? "fil_transform" : "exp_transform"}\n`
      if (groupFields.length > 0) {
        generatedSql += `GROUP BY ${groupFields.join(", ")};\n`
      } else {
        generatedSql += `GROUP BY REGION_CODE;\n`
      }

      return { sql: generatedSql, mappingName, transformations }
    } catch (err) {
      return { sql: `-- Error parsing Informatica XML`, mappingName: "", transformations: [] }
    }
  }, [xmlInput, targetDialect])

  // Mode 2: Parse Parameter File & Replace Parameters inside Query
  const resolvedParamData = useMemo(() => {
    if (!paramQuery.trim()) {
      return { resolvedSql: "-- Enter a query containing $$ parameters", detectedParams: {}, replacedCount: 0 }
    }

    // Extract key-values from parameter file
    const paramMap: Record<string, string> = {}
    const lines = paramFileContent.split("\n")
    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("[") && trimmed.includes("=")) {
        const parts = trimmed.split("=")
        const key = parts[0].trim()
        const val = parts.slice(1).join("=").trim()
        paramMap[key] = val
      }
    })

    // Find all parameters ($$PARAM or $PARAM) in query
    const foundParams = Array.from(paramQuery.matchAll(/\$\$?[A-Za-z0-9_]+/g)).map((m) => m[0])
    const uniqueFoundParams = Array.from(new Set(foundParams))

    let resolvedSql = paramQuery
    let replacedCount = 0

    uniqueFoundParams.forEach((paramKey) => {
      if (paramMap[paramKey] !== undefined) {
        const val = paramMap[paramKey]
        const escapedKey = paramKey.replace(/\$/g, "\\$")
        resolvedSql = resolvedSql.replace(new RegExp(escapedKey, "g"), val)
        replacedCount++
      }
    })

    return { resolvedSql, detectedParams: paramMap, uniqueFoundParams, replacedCount }
  }, [paramQuery, paramFileContent])

  const handleCopy = () => {
    const textToCopy = mode === "xml" ? parsedXmlData.sql : resolvedParamData.resolvedSql
    navigator.clipboard.writeText(textToCopy).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const textToDownload = mode === "xml" ? parsedXmlData.sql : resolvedParamData.resolvedSql
    const filename = mode === "xml" ? `${parsedXmlData.mappingName || "mapping"}_converted.sql` : "resolved_parameter_query.sql"
    const blob = new Blob([textToDownload], { type: "application/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleXmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onerror = () => {}
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      if (content) setXmlInput(content)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleParamUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onerror = () => {}
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      if (content) setParamFileContent(content)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
            <FileCode2 className="h-3.5 w-3.5" />
            <span>Informatica PowerCenter & IICS Toolkit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Informatica XML & Parameter File SQL Resolver</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Convert Informatica XML mappings to runnable SQL OR bind Informatica parameter files (`.par` / `$$PARAM`) to resolve runnable production queries.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setMode("xml")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${
              mode === "xml" ? "bg-white text-black font-bold shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            1. XML Mapping Converter
          </button>
          <button
            onClick={() => setMode("param")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition-all ${
              mode === "param" ? "bg-sky-400 text-black font-bold shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            2. Parameter File (.par) Resolver
          </button>
        </div>
      </div>

      {/* MODE 1: XML Mapping Converter */}
      {mode === "xml" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-white">Informatica XML Mapping Input</CardTitle>
              <div className="flex items-center gap-2">
                <label htmlFor="infa-xml-file-upload" className="cursor-pointer">
                  <span className="rounded border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs px-2.5 py-1 inline-flex items-center gap-1">
                    <Upload className="h-3 w-3" /> Upload XML
                  </span>
                  <input id="infa-xml-file-upload" type="file" accept=".xml" className="hidden" onChange={handleXmlUpload} />
                </label>
                <Button size="sm" variant="outline" className="text-xs border-white/20 bg-white/5" onClick={() => setXmlInput(SAMPLE_INFORMATICA_XML)}>
                  Reset Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="420px" defaultLanguage="xml" theme="vs-dark" value={xmlInput} onChange={(v) => setXmlInput(v || "")} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-white">Generated Testable CTE SQL Query</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleDownload} className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  <span>Download .sql</span>
                </Button>
                <Button size="sm" onClick={handleCopy} className="bg-white text-black hover:bg-white/90 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="ml-1">{copied ? "Copied!" : "Copy SQL"}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="420px" defaultLanguage="sql" theme="vs-dark" value={parsedXmlData.sql} options={{ readOnly: true }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODE 2: Parameter File Resolver */}
      {mode === "param" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Query with Parameters */}
          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white">1. Parameterized Query Input</CardTitle>
              <CardDescription className="text-xs text-white/60">Query containing $$PARAM placeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="360px" defaultLanguage="sql" theme="vs-dark" value={paramQuery} onChange={(v) => setParamQuery(v || "")} />
              </div>
            </CardContent>
          </Card>

          {/* Parameter File Content */}
          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-sky-400">2. Parameter File (.par) Values</CardTitle>
              <CardDescription className="text-xs text-white/60">Key=Value definitions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="280px" defaultLanguage="ini" theme="vs-dark" value={paramFileContent} onChange={(v) => setParamFileContent(v || "")} />
              </div>

              {resolvedParamData.uniqueFoundParams && (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-white/50 uppercase">Detected Parameters ({resolvedParamData.uniqueFoundParams.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {resolvedParamData.uniqueFoundParams.map((p) => (
                      <Badge key={p} variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-300 text-[10px] font-mono">
                        {p} = {resolvedParamData.detectedParams[p] || "MISSING"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolved Runnable Output Query */}
          <Card className="border-white/15 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-emerald-400">3. Runnable Substituted Query</CardTitle>
                <CardDescription className="text-xs text-white/60">Ready to execute in database</CardDescription>
              </div>
              <Button size="sm" onClick={handleCopy} className="bg-white text-black hover:bg-white/90 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1">{copied ? "Copied!" : "Copy SQL"}</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
                <Editor height="360px" defaultLanguage="sql" theme="vs-dark" value={resolvedParamData.resolvedSql} options={{ readOnly: true }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
