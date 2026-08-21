// src/layouts/Footer.tsx
import { Terminal, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 dark:border-white/10 bg-background/80 dark:bg-[#0d0d0d]/80 backdrop-blur-md px-4 sm:px-6 pt-4 pb-20 md:pb-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground dark:text-white/60">
        {/* Brand & Privacy Statement */}
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-foreground dark:text-white/80" />
          <span className="font-semibold text-foreground dark:text-white/90">DataMaster Pro</span>
          <span className="hidden sm:inline text-muted-foreground/60 dark:text-white/40">• In-Browser & Privacy First</span>
        </div>

        {/* Attribution Badge */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span>Built with</span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse" aria-hidden="true" />
          <span>by</span>
          <a
            href="https://naveenguru.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground dark:text-white hover:text-primary dark:hover:text-white transition-all duration-200 underline decoration-primary/40 dark:decoration-white/40 hover:decoration-primary dark:hover:decoration-white underline-offset-4 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          >
            Naveen
          </a>
        </div>
      </div>
    </footer>
  )
}
