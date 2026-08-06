import { cn } from "@/shared/utils/cn"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface LoadingSkeletonProps {
  variant?: "home" | "full" | "grid" | "list" | "editor"
  className?: string
}

export function LoadingSkeleton({ variant = "full", className }: LoadingSkeletonProps) {
  if (variant === "home") {
    return (
      <div className={cn("p-6 space-y-6", className)}>
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === "grid") {
    return (
      <div className={cn("p-6 space-y-4", className)}>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("p-6 space-y-3", className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (variant === "editor") {
    return (
      <div className={cn("p-6 space-y-4", className)}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className={cn("p-6 space-y-4", className)}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
