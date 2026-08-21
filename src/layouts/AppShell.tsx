import { Outlet, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Sidebar } from "@/layouts/Sidebar"
import { Header } from "@/layouts/Header"
import { Footer } from "@/layouts/Footer"
import { MobileNav } from "@/layouts/MobileNav"
import { useAppStore } from "@/stores"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"

export default function AppShell() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setMobileNavOpen = useAppStore((s) => s.setMobileNavOpen)
  const incrementPageVisit = useAppStore((s) => s.incrementPageVisit)
  const location = useLocation()
  const isMobile = useMediaQuery("(max-width: 767px)")

  // Track page visits
  useEffect(() => {
    const pageName = location.pathname === "/" ? "home" : location.pathname.slice(1)
    incrementPageVisit(pageName)
  }, [location.pathname, incrementPageVisit])

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setMobileNavOpen(false)
    }
  }, [location.pathname, isMobile, setMobileNavOpen])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-60" : "md:ml-16"
        }`}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden max-w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
      <MobileNav />
    </div>
  )
}
