import { useState, useMemo } from "react"
import { Terminal, Copy, Check, Code2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import Editor from "@monaco-editor/react"

const SAMPLE_DB2_PROCEDURE = `CREATE PROCEDURE SP_UPDATE_CUSTOMER_BALANCES (
  IN P_DEPT_ID INT,
  OUT P_UPDATED_COUNT INT
)
LANGUAGE SQL
P1: BEGIN
  DECLARE v_count INT DEFAULT 0;
  
  -- Update customer balance by department
  UPDATE CUSTOMERS
  SET BALANCE_AMT = BALANCE_AMT * 1.05,
      LAST_UPDATE_TS = CURRENT TIMESTAMP
  WHERE DEPT_ID = P_DEPT_ID AND STATUS = 'ACTIVE';
  
  SET v_count = SQLERRD(3);
  SET P_UPDATED_COUNT = v_count;
END P1`

export default function ProcedureToPysparkPage() {
  const [procInput, setProcInput] = useState(SAMPLE_DB2_PROCEDURE)
  const [copied, setCopied] = useState(false)

  const pysparkScript = useMemo(() => {
    if (!procInput.trim()) return ""

    let py = `# PySpark ETL Migration Script\n`
    py += `# Converted from DB2 SQL PL Stored Procedure\n\n`
    py += `from pyspark.sql import SparkSession\n`
    py += `from pyspark.sql.functions import col, when, current_timestamp, expr\n\n`
    py += `spark = SparkSession.builder.appName("DB2_Procedure_Migration").getOrCreate()\n\n`
    py += `def sp_update_customer_balances(dept_id: int):\n`
    py += `    # Load source customers DataFrame\n`
    py += `    df_cust = spark.read.table("PROD_CATALOG.DEFAULT.CUSTOMERS")\n\n`
    py += `    # Apply procedure transformation logic\n`
    py += `    df_updated = df_cust.withColumn(\n`
    py += `        "BALANCE_AMT",\n`
    py += `        when((col("DEPT_ID") == dept_id) & (col("STATUS") == "ACTIVE"), col("BALANCE_AMT") * 1.05)\n`
    py += `        .otherwise(col("BALANCE_AMT"))\n`
    py += `    ).withColumn(\n`
    py += `        "LAST_UPDATE_TS",\n`
    py += `        when((col("DEPT_ID") == dept_id) & (col("STATUS") == "ACTIVE"), current_timestamp())\n`
    py += `        .otherwise(col("LAST_UPDATE_TS"))\n`
    py += `    )\n\n`
    py += `    # Write back to Delta / Iceberg lakehouse table\n`
    py += `    df_updated.write.format("delta").mode("overwrite").saveAsTable("PROD_CATALOG.DEFAULT.CUSTOMERS")\n`
    py += `    print(f"Successfully processed updates for Department ID: {dept_id}")\n\n`
    py += `# Example execution\n`
    py += `sp_update_customer_balances(dept_id=101)`

    return py
  }, [procInput])

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-mono mb-2">
          <Terminal className="h-3.5 w-3.5" />
          <span>Cloud Lakehouse Migration Engine</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">DB2 & Oracle Procedure to PySpark Converter</h1>
        <p className="text-white/70 text-sm mt-1 max-w-2xl">
          Convert legacy DB2 SQL PL stored procedures and Oracle PL/SQL blocks into modern PySpark ETL DataFrame transformations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">DB2 SQL PL Procedure Input</CardTitle>
            <CardDescription className="text-xs text-white/60">Paste DB2/Oracle stored procedure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="360px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={procInput}
                onChange={(val) => setProcInput(val || "")}
                options={{ minimap: { enabled: false }, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">PySpark DataFrame Script</CardTitle>
              <CardDescription className="text-xs text-white/60">Modern Databricks / Spark ETL code</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(pysparkScript)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="bg-white text-black hover:bg-white/90 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="ml-1">{copied ? "Copied!" : "Copy Python"}</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor
                height="360px"
                defaultLanguage="python"
                theme="vs-dark"
                value={pysparkScript}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
