import { Inbox } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import { Button } from "@/shared/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title = "Nothing here yet",
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="text-muted-foreground mb-4">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{message}</p>
      )}
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
