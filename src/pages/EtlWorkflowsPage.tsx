import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  Handle,
  Position,
  type NodeProps,
} from "reactflow"
import "reactflow/dist/style.css"
import { Play, Pause, RotateCcw, Maximize, Minimize, Database, GitBranch, Wrench, Table2, Cpu, Info } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/utils/cn"
import { EmptyState } from "@/shared/components/EmptyState"
import { workflowPresets } from "@/content/workflow-presets"

function SourceNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 min-w-[120px] shadow-lg">
      <Handle type="source" position={Position.Right} className="!bg-emerald-400" />
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-300">{data.label}</span>
      </div>
      <div className="text-[9px] text-emerald-400/60 mt-0.5">Source</div>
    </div>
  )
}

function TransformNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-lg border-2 border-blue-500/50 bg-blue-500/10 min-w-[120px] shadow-lg">
      <Handle type="target" position={Position.Left} className="!bg-blue-400" />
      <Handle type="source" position={Position.Right} className="!bg-blue-400" />
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4 text-blue-400" />
        <span className="text-xs font-medium text-blue-300">{data.label}</span>
      </div>
      <div className="text-[9px] text-blue-400/60 mt-0.5">Transform</div>
    </div>
  )
}

function LoadNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-lg border-2 border-purple-500/50 bg-purple-500/10 min-w-[120px] shadow-lg">
      <Handle type="target" position={Position.Left} className="!bg-purple-400" />
      <div className="flex items-center gap-2">
        <Table2 className="h-4 w-4 text-purple-400" />
        <span className="text-xs font-medium text-purple-300">{data.label}</span>
      </div>
      <div className="text-[9px] text-purple-400/60 mt-0.5">Load</div>
    </div>
  )
}

function ErrorHandlerNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 min-w-[120px] shadow-lg">
      <Handle type="target" position={Position.Left} className="!bg-red-400" />
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-red-400" />
        <span className="text-xs font-medium text-red-300">{data.label}</span>
      </div>
      <div className="text-[9px] text-red-400/60 mt-0.5">Error Handler</div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  source: SourceNode,
  transform: TransformNode,
  load: LoadNode,
  errorHandler: ErrorHandlerNode,
}

export default function EtlWorkflowsPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [simStep, setSimStep] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [logEntries, setLogEntries] = useState<string[]>([])
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const selectedPreset = selectedPresetId
    ? workflowPresets.find((p) => p.id === selectedPresetId)
    : null

  const initialNodes: Node[] = useMemo(() => {
    if (!selectedPreset) return []
    return selectedPreset.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { label: n.label, ...n.config },
    }))
  }, [selectedPreset])

  const initialEdges: Edge[] = useMemo(() => {
    if (!selectedPreset) return []
    return selectedPreset.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: false,
      style: { stroke: "hsl(217.2, 32.6%, 40%)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(217.2, 32.6%, 40%)" },
    }))
  }, [selectedPreset])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Reset when preset changes
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    setSimStep(0)
    setSimulating(false)
    setLogEntries([])
    if (simIntervalRef.current) clearInterval(simIntervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPresetId])

  const handleSelectPreset = (id: string) => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current)
    setSimulating(false)
    setSimStep(0)
    setLogEntries([])
    setSelectedPresetId(id)

    const preset = workflowPresets.find((p) => p.id === id)
    if (!preset) return

    const newNodes: Node[] = preset.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { label: n.label, ...n.config },
    }))

    const newEdges: Edge[] = preset.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: false,
      style: { stroke: "hsl(217.2, 32.6%, 40%)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(217.2, 32.6%, 40%)" },
    }))

    setNodes(newNodes)
    setEdges(newEdges)
  }

  const simulate = useCallback(() => {
    if (simulating) {
      // Pause
      if (simIntervalRef.current) clearInterval(simIntervalRef.current)
      setSimulating(false)
      return
    }

    // Start or resume
    setSimulating(true)
    const edgesToAnimate = selectedPreset?.edges || []
    const totalSteps = edgesToAnimate.length

    if (simStep >= totalSteps) {
      setSimStep(0)
      setLogEntries([])
      setEdges((eds) =>
        eds.map((e) => ({ ...e, animated: false, style: { ...e.style, stroke: "hsl(217.2, 32.6%, 40%)" } }))
      )
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: false } })))
    }

    let step = simStep

    simIntervalRef.current = setInterval(() => {
      if (step >= totalSteps) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current)
        setSimulating(false)
        setLogEntries((prev) => [...prev, "✅ Pipeline completed successfully!"])
        return
      }

      const edgeDef = edgesToAnimate[step]
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeDef.id
            ? { ...e, animated: true, style: { ...e.style, stroke: "hsl(142.1, 76.2%, 36.3%)" } }
            : e
        )
      )

      // Highlight target node
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, active: n.id === edgeDef.target } }))
      )

      setLogEntries((prev) => [
        ...prev,
        `🔄 ${step + 1}/${totalSteps}: ${edgeDef.label || "Processing data"} (${edgeDef.source} → ${edgeDef.target})`,
      ])

      step++
      setSimStep(step)
    }, 1200)

    simIntervalRef.current
  }, [simulating, simStep, selectedPreset, setEdges, setNodes])

  const resetSimulation = useCallback(() => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current)
    setSimulating(false)
    setSimStep(0)
    setLogEntries([])
    setEdges((eds) =>
      eds.map((e) => ({ ...e, animated: false, style: { ...e.style, stroke: "hsl(217.2, 32.6%, 40%)" } }))
    )
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, active: false } })))
  }, [setEdges, setNodes])

  // No preset selected
  if (!selectedPreset) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ETL Workflow Visualizer</h1>
          <p className="text-muted-foreground mt-1">
            Explore common ETL pipeline patterns with interactive workflow diagrams.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {workflowPresets.map((preset) => (
            <Card
              key={preset.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
              onClick={() => handleSelectPreset(preset.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm">{preset.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{preset.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      preset.difficulty === "beginner" && "text-green-400 border-green-500/30",
                      preset.difficulty === "intermediate" && "text-yellow-400 border-yellow-500/30",
                      preset.difficulty === "advanced" && "text-red-400 border-red-500/30"
                    )}
                  >
                    {preset.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {preset.category.replace("-", " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {preset.nodes.length} nodes
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <EmptyState
          title="Select a workflow to visualize"
          message="Choose a preset from the list above to see its interactive flow diagram."
        />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", fullscreen ? "fixed inset-0 z-50 bg-background" : "h-[calc(100vh-3.5rem)]")}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPresetId(null)} className="text-xs">
            ← Back
          </Button>
          <span className="text-sm font-medium">{selectedPreset.name}</span>
          <Badge variant="outline" className="text-[10px] capitalize">{selectedPreset.difficulty}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={simulating ? "secondary" : "default"}
            onClick={simulate}
          >
            {simulating ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
            {simulating ? "Pause" : "Simulate"}
          </Button>
          <Button size="sm" variant="outline" onClick={resetSimulation}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Flow + Log */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes.map((n) => ({
              ...n,
              style: {
                ...(n.data?.active ? { boxShadow: "0 0 15px rgba(52, 211, 153, 0.5)" } : {}),
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="hsl(217.2, 32.6%, 15%)" gap={20} />
            <Controls className="!bg-card !border-border" />
            <MiniMap
              nodeColor={() => "hsl(217.2, 32.6%, 25%)"}
              maskColor="rgba(0,0,0,0.7)"
              className="!border !border-border"
            />
          </ReactFlow>
        </div>

        {/* Log panel */}
        {logEntries.length > 0 && (
          <div className="w-64 border-l border-border bg-muted/5 hidden md:block">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
              Simulation Log
            </div>
            <ScrollArea className="h-[calc(100%-33px)]">
              <div className="p-2 space-y-1">
                {logEntries.map((entry, i) => (
                  <div key={i} className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    {entry}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
