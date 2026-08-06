import * as React from "react"
import { cn } from "@/shared/utils/cn"

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ content, children, side = "top", className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

    const show = () => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setVisible(true), 300)
    }
    const hide = () => {
      clearTimeout(timeoutRef.current)
      setVisible(false)
    }

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        {...props}
      >
        {children}
        {visible && (
          <div
            role="tooltip"
            className={cn(
              "absolute z-50 px-2 py-1 text-xs rounded-md bg-popover text-popover-foreground border shadow-sm whitespace-nowrap pointer-events-none",
              side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-1",
              side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-1",
              side === "left" && "right-full top-1/2 -translate-y-1/2 mr-1",
              side === "right" && "left-full top-1/2 -translate-y-1/2 ml-1"
            )}
          >
            {content}
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

export { Tooltip }
