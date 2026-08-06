import { X, Plus } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import type { QueryTab } from "@/shared/types/store"

interface EditorTabsProps {
  tabs: QueryTab[]
  activeTabId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onAddTab: () => void
}

export function EditorTabs({ tabs, activeTabId, onSelectTab, onCloseTab, onAddTab }: EditorTabsProps) {
  return (
    <div className="flex items-center border-b border-border bg-muted/20">
      <ScrollArea className="flex-1">
        <div className="flex">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-border cursor-pointer select-none group",
                tab.id === activeTabId
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
              onClick={() => onSelectTab(tab.id)}
              role="tab"
              aria-selected={tab.id === activeTabId}
            >
              <span className="truncate max-w-[100px]">{tab.name}</span>
              {tab.isExecuting && (
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
              )}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseTab(tab.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-0.5 transition-opacity"
                  aria-label={`Close ${tab.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 mx-1"
        onClick={onAddTab}
        aria-label="Add new tab"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
