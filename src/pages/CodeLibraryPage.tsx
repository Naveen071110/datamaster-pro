import { useState, useMemo, useCallback } from "react"
import { Search, Copy, Check, Bookmark, BookmarkCheck, Code, Filter, X } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/utils/cn"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { useAppStore } from "@/stores"
import { snippets } from "@/content/snippets"
import type { CodeSnippet } from "@/shared/types/content"

const tools = [...new Set(snippets.map((s) => s.tool))] as const
const difficulties = ["beginner", "intermediate", "advanced"] as const

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 hover:bg-muted rounded transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  )
}

function SnippetDialog({
  snippet,
  open,
  onOpenChange,
}: {
  snippet: CodeSnippet
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { isBookmarked, addBookmark, removeBookmark } = useAppStore()
  const bookmarked = isBookmarked(snippet.id, "snippet")

  const handleBookmark = useCallback(() => {
    if (bookmarked) {
      removeBookmark(snippet.id, "snippet")
    } else {
      addBookmark({
        type: "snippet",
        targetId: snippet.id,
        title: snippet.title,
        path: "/code-library",
        tags: snippet.tags,
      })
    }
  }, [bookmarked, snippet, addBookmark, removeBookmark])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{snippet.title}</DialogTitle>
              <DialogDescription>{snippet.description}</DialogDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleBookmark}>
                {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              <CopyButton code={snippet.code} />
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto space-y-4">
          <pre className="p-4 rounded-md bg-muted/30 border border-border/50 overflow-x-auto">
            <code className="text-sm font-mono whitespace-pre">{snippet.code}</code>
          </pre>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Usage</h4>
            <p className="text-sm text-muted-foreground">{snippet.usage}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">{snippet.language}</Badge>
            <Badge variant="outline" className="text-[10px]">{snippet.tool}</Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                snippet.difficulty === "beginner" && "text-green-400",
                snippet.difficulty === "intermediate" && "text-yellow-400",
                snippet.difficulty === "advanced" && "text-red-400"
              )}
            >
              {snippet.difficulty}
            </Badge>
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CodeLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 200)

  const filtered = useMemo(() => {
    let items = snippets
    if (selectedTool) items = items.filter((s) => s.tool === selectedTool)
    if (selectedDifficulty) items = items.filter((s) => s.difficulty === selectedDifficulty)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      items = items.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.code.toLowerCase().includes(q)
      )
    }
    return items
  }, [selectedTool, selectedDifficulty, debouncedSearch])

  const hasActiveFilters = selectedTool || selectedDifficulty || debouncedSearch

  const clearFilters = () => {
    setSelectedTool(null)
    setSelectedDifficulty(null)
    setSearchQuery("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] text-white">
      {/* Header & Search Toolbar */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center border-l-2 border-white bg-white/15 px-3 py-1 backdrop-blur-md">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">
              Data Engineering Vault
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 border border-white/15 bg-white/5 px-2.5 py-1 rounded-full">
            50+ Snippets
          </span>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder="Search SQL, Python, PySpark, Airflow snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#141414] border-white/15 text-white placeholder:text-white/40 focus:border-white rounded-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Tool:</span>
          {tools.map((tool) => (
            <Button
              key={tool}
              variant={selectedTool === tool ? "default" : "outline"}
              size="sm"
              className="text-xs capitalize"
              onClick={() => setSelectedTool(selectedTool === tool ? null : tool)}
            >
              {tool}
            </Button>
          ))}
          <span className="text-xs text-muted-foreground font-medium ml-2">Level:</span>
          {difficulties.map((diff) => (
            <Button
              key={diff}
              variant={selectedDifficulty === diff ? "default" : "outline"}
              size="sm"
              className="text-xs capitalize"
              onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
            >
              {diff}
            </Button>
          ))}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results info */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50 flex items-center justify-between">
        <span>{filtered.length} snippet{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No snippets found</p>
              <p className="text-xs mt-1">Try different filters or search terms</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((snippet) => (
                <Card
                  key={snippet.id}
                  className="cursor-pointer hover:bg-accent/30 transition-colors border-border/50"
                  onClick={() => setSelectedSnippet(snippet)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-medium leading-snug line-clamp-2">{snippet.title}</h3>
                      <CopyButton code={snippet.code} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{snippet.description}</p>
                    <pre className="text-xs font-mono bg-muted/20 p-2 rounded border border-border/30 overflow-hidden max-h-20 mb-2">
                      <code className="line-clamp-3">{snippet.code}</code>
                    </pre>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px] uppercase">{snippet.language}</Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          snippet.difficulty === "beginner" && "text-green-400 border-green-500/30",
                          snippet.difficulty === "intermediate" && "text-yellow-400 border-yellow-500/30",
                          snippet.difficulty === "advanced" && "text-red-400 border-red-500/30"
                        )}
                      >
                        {snippet.difficulty}
                      </Badge>
                      {snippet.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[9px] text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Detail dialog */}
      {selectedSnippet && (
        <SnippetDialog
          snippet={selectedSnippet}
          open={!!selectedSnippet}
          onOpenChange={(open) => !open && setSelectedSnippet(null)}
        />
      )}
    </div>
  )
}
