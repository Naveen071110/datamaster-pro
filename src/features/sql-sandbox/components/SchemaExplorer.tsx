import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, Table2 } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Badge } from "@/shared/components/ui/badge"

interface SchemaItem {
  tableName: string
  columns: { name: string; type: string }[]
}

interface SchemaExplorerProps {
  schema: SchemaItem[]
}

export function SchemaExplorer({ schema }: SchemaExplorerProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(schema.slice(0, 2).map(s => s.tableName)))

  useEffect(() => {
    if (schema.length > 0 && expandedTables.size === 0) {
      setExpandedTables(new Set(schema.slice(0, 2).map((s) => s.tableName)))
    }
  }, [schema])

  const toggleTable = (name: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  if (schema.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        Loading schema...
      </div>
    )
  }

  return (
    <ScrollArea className="max-h-[400px]">
      <div className="space-y-0.5 p-2">
        {schema.map((table) => (
          <div key={table.tableName}>
            <button
              onClick={() => toggleTable(table.tableName)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted/50 transition-colors text-left"
            >
              {expandedTables.has(table.tableName) ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <Table2 className="h-4 w-4 text-primary" />
              <span className="font-medium">{table.tableName}</span>
              <Badge variant="outline" className="ml-auto text-[10px]">
                {table.columns.length}
              </Badge>
            </button>
            {expandedTables.has(table.tableName) && (
              <div className="ml-6 space-y-0.5">
                {table.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>{col.name}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
