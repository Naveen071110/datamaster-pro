import { lazy, Suspense } from "react"
import { createBrowserRouter, type RouteObject } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton"

const HomePage = lazy(() => import("@/pages/HomePage"))
const SqlSandboxPage = lazy(() => import("@/pages/SqlSandboxPage"))
const DdlGeneratorPage = lazy(() => import("@/pages/DdlGeneratorPage"))
const DataProfilerPage = lazy(() => import("@/pages/DataProfilerPage"))
const SchemaDiffPage = lazy(() => import("@/pages/SchemaDiffPage"))
const SqlFormatterPage = lazy(() => import("@/pages/SqlFormatterPage"))
const CodeLibraryPage = lazy(() => import("@/pages/CodeLibraryPage"))
const EtlWorkflowsPage = lazy(() => import("@/pages/EtlWorkflowsPage"))

function LazyPage({ Component, variant }: { Component: React.ComponentType; variant?: "home" | "full" | "grid" | "list" | "editor" }) {
  return (
    <Suspense fallback={<LoadingSkeleton variant={variant || "full"} />}>
      <Component />
    </Suspense>
  )
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-muted-foreground text-lg mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  )
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LazyPage Component={HomePage} variant="home" /> },
      { path: "sql-sandbox", element: <LazyPage Component={SqlSandboxPage} variant="editor" /> },
      { path: "ddl-generator", element: <LazyPage Component={DdlGeneratorPage} variant="editor" /> },
      { path: "data-profiler", element: <LazyPage Component={DataProfilerPage} variant="full" /> },
      { path: "schema-diff", element: <LazyPage Component={SchemaDiffPage} variant="editor" /> },
      { path: "sql-formatter", element: <LazyPage Component={SqlFormatterPage} variant="editor" /> },
      { path: "code-library", element: <LazyPage Component={CodeLibraryPage} variant="grid" /> },
      { path: "etl-workflows", element: <LazyPage Component={EtlWorkflowsPage} variant="full" /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
