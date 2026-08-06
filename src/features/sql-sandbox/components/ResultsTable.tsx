import React from "react"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

interface ResultsTableProps {
  columns: string[]
  rows: Record<string, unknown>[]
  maxHeight?: string
}

export function ResultsTable({ columns, rows, maxHeight = "300px" }: ResultsTableProps) {
  if (columns.length === 0 && rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
        No results to display.
      </div>
    )
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <ScrollArea style={{ maxHeight }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-10">#</th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1.5 whitespace-nowrap max-w-[300px] truncate">
                      {formatValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
      <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border/50 bg-muted/20 flex justify-between">
        <span>{rows.length} row{rows.length !== 1 ? "s" : ""}</span>
        <span>{columns.length} column{columns.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  )
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">NULL</span>
  }
  return String(value)
}
