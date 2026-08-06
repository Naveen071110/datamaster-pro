import { useState, useMemo, useCallback } from "react"
import { Search, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, ChevronRight, Filter } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/utils/cn"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { useAppStore } from "@/stores"
import { qaContent, type QAItem } from "@/content/qa-content"

const categories = [
  { id: "basic-sql", label: "Basic SQL", count: 0 },
  { id: "joins", label: "Joins", count: 0 },
  { id: "aggregation", label: "Aggregation", count: 0 },
  { id: "subqueries", label: "Subqueries", count: 0 },
  { id: "window-functions", label: "Window Functions", count: 0 },
  { id: "cte-recursive", label: "CTE & Recursive", count: 0 },
  { id: "performance-tuning", label: "Performance", count: 0 },
  { id: "etl-transforms", label: "ETL Transforms", count: 0 },
]

export default function QAPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const { isBookmarked, addBookmark, removeBookmark } = useAppStore()

  const debouncedSearch = useDebounce(searchQuery, 200)

  // Update category counts
  const categoriesWithCounts = useMemo(() =>
    categories.map((cat) => ({
      ...cat,
      count: qaContent.filter((q) => q.category === cat.id).length,
    })),
  [])

  // Filtered content
  const filteredQA = useMemo(() => {
    let items = qaContent
    if (selectedCategory) {
      items = items.filter((q) => q.category === selectedCategory)
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return items
  }, [selectedCategory, debouncedSearch])

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBookmark = useCallback(
    (item: QAItem) => {
      if (isBookmarked(item.id, "qa")) {
        removeBookmark(item.id, "qa")
      } else {
        addBookmark({
          type: "qa",
          targetId: item.id,
          title: item.question,
          path: "/qa",
          tags: item.tags,
        })
      }
    },
    [isBookmarked, addBookmark, removeBookmark]
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Category sidebar */}
      <aside className="hidden md:block w-56 border-r border-border bg-muted/5 p-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Topics
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between",
              !selectedCategory
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <span>All Topics</span>
            <Badge variant="outline" className="text-[10px]">{qaContent.length}</Badge>
          </button>
          {categoriesWithCounts.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between",
                selectedCategory === cat.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <span>{cat.label}</span>
              <Badge variant="outline" className="text-[10px]">{cat.count}</Badge>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search bar */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, answers, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50">
          {filteredQA.length} question{filteredQA.length !== 1 ? "s" : ""}
          {selectedCategory && ` in ${categoriesWithCounts.find((c) => c.id === selectedCategory)?.label}`}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {filteredQA.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No questions found</p>
                <p className="text-xs mt-1">Try a different search or category</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2 max-w-4xl">
              {filteredQA.map((item) => {
                const isExpanded = expandedCards.has(item.id)
                const bookmarked = isBookmarked(item.id, "qa")
                return (
                  <Card key={item.id} className="border-border/50">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleCard(item.id)}
                        className="flex items-start gap-3 w-full text-left p-4 hover:bg-muted/10 transition-colors"
                      >
                        <div className="mt-0.5 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium leading-snug">
                              {item.question}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] capitalize",
                                  item.difficulty === "easy" && "text-green-400 border-green-500/30",
                                  item.difficulty === "medium" && "text-yellow-400 border-yellow-500/30",
                                  item.difficulty === "hard" && "text-red-400 border-red-500/30"
                                )}
                              >
                                {item.difficulty}
                              </Badge>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBookmark(item)
                                }}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                              >
                                {bookmarked ? (
                                  <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-border/50">
                          <div className="mt-3 space-y-3">
                            <div className="text-sm text-muted-foreground leading-relaxed">
                              {item.answer}
                            </div>
                            {item.code && (
                              <pre className="p-3 rounded-md bg-muted/30 border border-border/50 overflow-x-auto">
                                <code className="text-xs font-mono whitespace-pre">{item.code}</code>
                              </pre>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
