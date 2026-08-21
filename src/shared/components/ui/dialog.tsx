import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/shared/utils/cn"

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("Dialog components must be used within Dialog")
  return context
}

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useDialog()

    React.useEffect(() => {
      if (!open) return
      document.body.style.overflow = "hidden"

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onOpenChange(false)
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleKeyDown)
      }
    }, [open, onOpenChange])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-50 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-lg border bg-background shadow-xl",
            className
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-muted transition-all"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-4 border-b border-border", className)} {...props} />
  )
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />
  )
)
DialogDescription.displayName = "DialogDescription"

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }
