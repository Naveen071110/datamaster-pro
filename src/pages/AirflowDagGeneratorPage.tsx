import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Workflow,
  Copy,
  Check,
  Download,
  Terminal,
  Clock,
  Plus,
  Trash2,
  GitBranch,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import Editor from "@monaco-editor/react"

interface DagTask {
  id: string
  name: string
  operator: "PythonOperator" | "BashOperator" | "SnowflakeOperator" | "PostgresOperator" | "EmailOperator"
  commandOrFunc: string
}

const DEFAULT_TASKS: DagTask[] = [
  { id: "1", name: "extract_s3_raw_data", operator: "PythonOperator", commandOrFunc: "extract_raw_s3_payloads" },
  { id: "2", name: "run_dbt_staging_models", operator: "BashOperator", commandOrFunc: "dbt run --select models/staging" },
  { id: "3", name: "execute_dbt_data_tests", operator: "BashOperator", commandOrFunc: "dbt test --select models/staging" },
  { id: "4", name: "publish_warehouse_aggregates", operator: "SnowflakeOperator", commandOrFunc: "CALL WAREHOUSE_PROD.PROC_MERGE_DAILY_METRICS();" },
]

export default function AirflowDagGeneratorPage() {
  const navigate = useNavigate()

  // DAG Parameters
  const [dagId, setDagId] = useState("enterprise_daily_lakehouse_pipeline")
  const [description, setDescription] = useState("Daily automated ingestion, dbt staging transformation, and Snowflake merge.")
  const [cronSchedule, setCronSchedule] = useState("0 2 * * *")
  const [owner, setOwner] = useState("data_engineering_team")
  const [retries, setRetries] = useState(2)
  const [retryDelayMinutes, setRetryDelayMinutes] = useState(5)
  const [catchup, setCatchup] = useState(false)
  const [tasks, setTasks] = useState<DagTask[]>(DEFAULT_TASKS)

  const [copied, setCopied] = useState(false)

  // Add Task
  const handleAddTask = () => {
    const newId = String(Date.now())
    setTasks([
      ...tasks,
      {
        id: newId,
        name: `task_${tasks.length + 1}`,
        operator: "BashOperator",
        commandOrFunc: "echo 'Executing pipeline step'",
      },
    ])
  }

  // Remove Task
  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  // Update Task
  const handleUpdateTask = (id: string, field: keyof DagTask, value: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          return { ...t, [field]: value }
        }
        return t
      })
    )
  }

  // Cron schedule human-readable explainer
  const cronDescription = useMemo(() => {
    if (cronSchedule === "@daily" || cronSchedule === "0 0 * * *") return "Runs every day at midnight (00:00 UTC)"
    if (cronSchedule === "0 2 * * *") return "Runs every day at 02:00 AM UTC"
    if (cronSchedule === "@hourly" || cronSchedule === "0 * * * *") return "Runs at minute 0 of every hour"
    if (cronSchedule === "*/15 * * * *") return "Runs every 15 minutes"
    if (cronSchedule === "0 6 * * 1-5") return "Runs at 06:00 AM UTC, Monday through Friday"
    return `Custom cron schedule: ${cronSchedule}`
  }, [cronSchedule])

  // Generate complete Python DAG Script
  const generatedPythonDag = useMemo(() => {
    const sanitizeIdent = (name: string) => {
      let cleaned = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_")
      if (/^[0-9]/.test(cleaned)) cleaned = "_" + cleaned
      return cleaned || "task"
    }

    // Collect all PythonOperator callables
    const pythonTasks = tasks.filter((t) => t.operator === "PythonOperator")
    const customCallables = Array.from(
      new Set(
        pythonTasks
          .map((t) => sanitizeIdent(t.commandOrFunc))
          .filter((name) => Boolean(name))
      )
    )

    let py = `"""\n`
    py += `Apache Airflow 2.x Python DAG\n`
    py += `DAG ID      : ${dagId}\n`
    py += `Description : ${description}\n`
    py += `Schedule    : ${cronSchedule} (${cronDescription})\n`
    py += `Generated on: ${new Date().toISOString()}\n`
    py += `"""\n\n`

    py += `from datetime import datetime, timedelta\n`
    py += `from airflow import DAG\n`
    py += `from airflow.operators.bash import BashOperator\n`
    py += `from airflow.operators.python import PythonOperator\n`
    if (tasks.some((t) => t.operator === "SnowflakeOperator")) {
      py += `from airflow.providers.snowflake.operators.snowflake import SnowflakeOperator\n`
    }
    if (tasks.some((t) => t.operator === "PostgresOperator")) {
      py += `from airflow.providers.postgres.operators.postgres import PostgresOperator\n`
    }
    py += `\n\n# Default Task Arguments\n`
    py += `default_args = {\n`
    py += `    "owner": "${owner}",\n`
    py += `    "depends_on_past": False,\n`
    py += `    "email_on_failure": True,\n`
    py += `    "email": ["data-alerts@enterprise.com"],\n`
    py += `    "retries": ${retries},\n`
    py += `    "retry_delay": timedelta(minutes=${retryDelayMinutes}),\n`
    py += `}\n\n`

    py += `# Custom Python Callables\n`
    if (customCallables.length === 0) {
      py += `def default_task_callable(**context):\n`
      py += `    execution_date = context.get("ds")\n`
      py += `    print(f"Executing pipeline step for business date: {execution_date}")\n`
      py += `    return {"status": "SUCCESS"}\n\n\n`
    } else {
      customCallables.forEach((fnName) => {
        py += `def ${fnName}(**context):\n`
        py += `    execution_date = context.get("ds")\n`
        py += `    print(f"Executing ${fnName} for business date: {execution_date}")\n`
        py += `    return {"status": "SUCCESS", "task": "${fnName}"}\n\n`
      })
      py += `\n`
    }

    py += `# DAG Definition\n`
    py += `with DAG(\n`
    py += `    dag_id="${dagId}",\n`
    py += `    default_args=default_args,\n`
    py += `    description="${description}",\n`
    py += `    schedule="${cronSchedule}",\n`
    py += `    start_date=datetime(2026, 1, 1),\n`
    py += `    catchup=${catchup ? "True" : "False"},\n`
    py += `    max_active_runs=1,\n`
    py += `    tags=["etl", "lakehouse", "dbt", "snowflake"],\n`
    py += `) as dag:\n\n`

    const sanitizedTasks = tasks.map((t) => ({
      ...t,
      varName: sanitizeIdent(t.name),
      funcName: sanitizeIdent(t.commandOrFunc),
    }))

    sanitizedTasks.forEach((t) => {
      py += `    ${t.varName} = `
      if (t.operator === "PythonOperator") {
        py += `PythonOperator(\n`
        py += `        task_id="${t.name}",\n`
        py += `        python_callable=${t.funcName},\n`
        py += `    )\n\n`
      } else if (t.operator === "BashOperator") {
        py += `BashOperator(\n`
        py += `        task_id="${t.name}",\n`
        py += `        bash_command="${t.commandOrFunc.replace(/"/g, '\\"')}",\n`
        py += `    )\n\n`
      } else if (t.operator === "SnowflakeOperator") {
        py += `SnowflakeOperator(\n`
        py += `        task_id="${t.name}",\n`
        py += `        snowflake_conn_id="snowflake_default",\n`
        py += `        sql="""${t.commandOrFunc}""",\n`
        py += `    )\n\n`
      } else {
        py += `BashOperator(\n`
        py += `        task_id="${t.name}",\n`
        py += `        bash_command="${t.commandOrFunc.replace(/"/g, '\\"')}",\n`
        py += `    )\n\n`
      }
    })

    if (sanitizedTasks.length > 1) {
      py += `    # Pipeline Task Execution Dependencies\n`
      py += `    ` + sanitizedTasks.map((t) => t.varName).join(" >> ") + `\n`
    }

    return py
  }, [dagId, description, cronSchedule, cronDescription, owner, retries, retryDelayMinutes, catchup, tasks])

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPythonDag).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedPythonDag], { type: "text/x-python" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dag_${dagId}.py`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono mb-2">
            <Workflow className="h-3.5 w-3.5" />
            <span>Apache Airflow 2.x Workflow Synthesizer</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Apache Airflow Python DAG Generator</h1>
          <p className="text-white/70 text-sm mt-1 max-w-2xl">
            Build production-ready Airflow 2.x Python DAGs with operator task chains (<code>&gt;&gt;</code>), retry policies, cron schedule validation, and Snowflake/dbt hooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => navigate("/etl-workflows")}
            className="bg-white text-black hover:bg-white/90 text-xs font-medium"
          >
            <GitBranch className="h-3.5 w-3.5 mr-1.5" />
            <span>Open Visual DAG Canvas</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings & Tasks Column */}
        <div className="space-y-4">
          {/* DAG Config Card */}
          <Card className="border-white/15 bg-white/5 backdrop-blur-md p-5 space-y-3">
            <CardTitle className="text-sm font-semibold text-white">DAG Parameters</CardTitle>

            <div>
              <label htmlFor="airflow-dag-id" className="text-xs font-mono text-white/60 block mb-1">DAG Identifier:</label>
              <input
                id="airflow-dag-id"
                type="text"
                value={dagId}
                onChange={(e) => setDagId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label htmlFor="airflow-dag-desc" className="text-xs font-mono text-white/60 block mb-1">Description:</label>
              <input
                id="airflow-dag-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="airflow-dag-owner" className="text-xs font-mono text-white/60 block mb-1">Owner:</label>
                <input
                  id="airflow-dag-owner"
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="airflow-cron-schedule" className="text-xs font-mono text-white/60">Schedule:</label>
                  <span className="text-[10px] font-mono text-sky-400 truncate max-w-[80px]">{cronDescription}</span>
                </div>
                <input
                  id="airflow-cron-schedule"
                  type="text"
                  value={cronSchedule}
                  onChange={(e) => setCronSchedule(e.target.value)}
                  placeholder="0 2 * * *"
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="airflow-retries" className="text-xs font-mono text-white/60 block mb-1">Retries:</label>
                <input
                  id="airflow-retries"
                  type="number"
                  min={0}
                  max={5}
                  value={retries}
                  onChange={(e) => setRetries(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label htmlFor="airflow-retry-delay" className="text-xs font-mono text-white/60 block mb-1">Retry Delay (m):</label>
                <input
                  id="airflow-retry-delay"
                  type="number"
                  min={1}
                  max={60}
                  value={retryDelayMinutes}
                  onChange={(e) => setRetryDelayMinutes(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <label htmlFor="airflow-catchup" className="text-xs font-mono text-white/80 cursor-pointer">Catchup Backfill:</label>
              <input
                id="airflow-catchup"
                type="checkbox"
                checked={catchup}
                onChange={(e) => setCatchup(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-[#0a0a0a] text-sky-400 focus:ring-sky-400"
              />
            </div>
          </Card>

          {/* Task Pipeline Chain Card */}
          <Card className="border-white/15 bg-white/5 backdrop-blur-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Task Chain ({tasks.length})</CardTitle>
              <Button size="sm" onClick={handleAddTask} variant="outline" className="text-xs border-white/20 bg-white/5 py-1 px-2.5">
                <Plus className="h-3 w-3 mr-1" /> Add Task
              </Button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {tasks.map((task, idx) => (
                <div key={task.id} className="p-3 rounded-lg border border-white/10 bg-[#0a0a0a] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-sky-400">Step {idx + 1}</span>
                    <button
                      onClick={() => handleRemoveTask(task.id)}
                      className="text-white/40 hover:text-rose-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleUpdateTask(task.id, "name", e.target.value)}
                    placeholder="task_name"
                    aria-label={`Step ${idx + 1} task name`}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={task.operator}
                      onChange={(e) => handleUpdateTask(task.id, "operator", e.target.value as any)}
                      aria-label={`Step ${idx + 1} operator`}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white"
                    >
                      <option value="PythonOperator">PythonOperator</option>
                      <option value="BashOperator">BashOperator</option>
                      <option value="SnowflakeOperator">SnowflakeOperator</option>
                    </select>

                    <input
                      type="text"
                      value={task.commandOrFunc}
                      onChange={(e) => handleUpdateTask(task.id, "commandOrFunc", e.target.value)}
                      placeholder="command or function"
                      aria-label={`Step ${idx + 1} command or function`}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Python DAG Output Column */}
        <Card className="lg:col-span-2 border-white/15 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">Generated `dag_{dagId}.py`</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Ready to deploy into your Airflow `dags/` folder
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleDownload} className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>Download .py</span>
              </Button>
              <Button size="sm" onClick={handleCopy} className="bg-white text-black hover:bg-white/90 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1.5">{copied ? "Copied!" : "Copy Python DAG"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
              <Editor height="520px" defaultLanguage="python" theme="vs-dark" value={generatedPythonDag} options={{ readOnly: true }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
