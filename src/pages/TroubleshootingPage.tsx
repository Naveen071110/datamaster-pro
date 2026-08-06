import { useState, useCallback } from "react"
import { ArrowLeft, Home, Bookmark, BookmarkCheck, Wifi, AlertTriangle, Clock, Table2, GitBranch, Copy, RefreshCw, BarChart3, ListOrdered, ChevronRight, Search } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/utils/cn"
import { useAppStore } from "@/stores"
import { troubleScenarios } from "@/content/troubleshooting-content"
import type { DecisionNode, SolutionNode, TroubleScenario } from "@/shared/types/content"

const iconMap: Record<string, React.ElementType> = {
  Wifi, AlertTriangle, Clock, Table2, GitBranch, Copy, RefreshCw, BarChart3, ListOrdered,
}

function isSolutionNode(node: DecisionNode | SolutionNode): node is SolutionNode {
  return "isSolution" in node && node.isSolution === true
}

function ScenarioCard({ scenario, onSelect }: { scenario: TroubleScenario; onSelect: () => void }) {
  const Icon = iconMap[scenario.icon] || Search
  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-border/50" onClick={onSelect}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{scenario.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
          <Badge variant="outline" className="mt-2 text-[10px] capitalize">
            {scenario.category}
          </Badge>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
      </CardContent>
    </Card>
  )
}

function QuestionNode({ node, onAnswer }: { node: DecisionNode; onAnswer: (answerId: string) => void }) {
  return (
    <Card className="max-w-2xl mx-auto border-primary/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {node.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {node.answers.map((answer) => (
            <Button
              key={answer.id}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => onAnswer(answer.id)}
            >
              {answer.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SolutionView({ solution }: { solution: SolutionNode }) {
  const { isBookmarked, addBookmark, removeBookmark } = useAppStore()
  const bookmarked = isBookmarked(solution.id, "troubleshooting")

  const handleBookmark = useCallback(() => {
    if (bookmarked) removeBookmark(solution.id, "troubleshooting")
    else addBookmark({ type: "troubleshooting", targetId: solution.id, title: solution.title, path: "/troubleshooting" })
  }, [bookmarked, solution, addBookmark, removeBookmark])

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card className="border-green-500/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Solution</span>
              </div>
              <CardTitle className="text-lg">{solution.title}</CardTitle>
              <CardDescription>{solution.description}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleBookmark}>
              {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Resolution Steps:</h4>
            <ol className="space-y-2">
              {solution.steps.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {solution.codeExample && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Code Example:</h4>
              <pre className="p-3 rounded-md bg-muted/30 border border-border/50 overflow-x-auto">
                <code className="text-xs font-mono whitespace-pre">{solution.codeExample}</code>
              </pre>
            </div>
          )}
          {solution.preventionTips && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Prevention Tips:</h4>
              <ul className="space-y-1">
                {solution.preventionTips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DecisionTreeView({
  scenario,
  path,
  onAnswer,
  onReset,
  onBack,
}: {
  scenario: TroubleScenario
  path: string[]
  onAnswer: (answerId: string) => void
  onReset: () => void
  onBack: () => void
}) {
  // Traverse tree based on path
  let currentNode: DecisionNode | SolutionNode = scenario.tree

  for (const answerId of path) {
    if (isSolutionNode(currentNode)) break
    const decisionNode = currentNode as DecisionNode
    const answer = decisionNode.answers.find((a) => a.id === answerId)
    if (!answer) break
    currentNode = answer.next
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5 inline mr-1" />
          Categories
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{scenario.title}</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {path.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-primary/50" />
        ))}
        {!isSolutionNode(currentNode) && (
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
        )}
      </div>

      {/* Current node */}
      {isSolutionNode(currentNode) ? (
        <>
          <SolutionView solution={currentNode} />
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <Button variant="outline" onClick={onBack}>
              <Home className="h-4 w-4 mr-2" />
              All Categories
            </Button>
          </div>
        </>
      ) : (
        <QuestionNode node={currentNode} onAnswer={onAnswer} />
      )}
    </div>
  )
}

export default function TroubleshootingPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const troubleHistory = useAppStore((s) => s.troubleHistory)
  const setNodePath = useAppStore((s) => s.setNodePath)
  const resetPath = useAppStore((s) => s.resetPath)

  const selectedScenario = selectedScenarioId
    ? troubleScenarios.find((s) => s.id === selectedScenarioId)
    : null

  const currentPath = selectedScenarioId ? troubleHistory[selectedScenarioId] || [] : []

  const filteredScenarios = troubleScenarios.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id)
  }

  const handleAnswer = (answerId: string) => {
    if (!selectedScenarioId) return
    const newPath = [...currentPath, answerId]
    setNodePath(selectedScenarioId, newPath)
  }

  const handleReset = () => {
    if (!selectedScenarioId) return
    resetPath(selectedScenarioId)
  }

  const handleBack = () => {
    setSelectedScenarioId(null)
  }

  if (selectedScenario && selectedScenarioId) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <DecisionTreeView
          scenario={selectedScenario}
          path={currentPath}
          onAnswer={handleAnswer}
          onReset={handleReset}
          onBack={handleBack}
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ETL Troubleshooting</h1>
        <p className="text-muted-foreground mt-1">
          Select a category below to diagnose common ETL pipeline issues.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search scenarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category groups */}
      <div className="space-y-6">
        {["connection", "data-quality", "performance", "schema", "dependency"].map((category) => {
          const items = filteredScenarios.filter((s) => s.category === category)
          if (items.length === 0) return null
          return (
            <div key={category}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 capitalize">
                {category.replace("-", " ")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onSelect={() => handleSelectScenario(scenario.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
