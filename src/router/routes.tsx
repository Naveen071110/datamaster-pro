import { lazy, Suspense } from "react"
import { createBrowserRouter, type RouteObject } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const HomePage = lazy(() => import("@/pages/HomePage"))
const SqlSandboxPage = lazy(() => import("@/pages/SqlSandboxPage"))
const DdlGeneratorPage = lazy(() => import("@/pages/DdlGeneratorPage"))
const DataProfilerPage = lazy(() => import("@/pages/DataProfilerPage"))
const SchemaDiffPage = lazy(() => import("@/pages/SchemaDiffPage"))
const SqlFormatterPage = lazy(() => import("@/pages/SqlFormatterPage"))
const CodeLibraryPage = lazy(() => import("@/pages/CodeLibraryPage"))
const EtlWorkflowsPage = lazy(() => import("@/pages/EtlWorkflowsPage"))
const PerformanceAnalyzerPage = lazy(() => import("@/pages/PerformanceAnalyzerPage"))
const QAPage = lazy(() => import("@/pages/QAPage"))
const SchemaValidatorPage = lazy(() => import("@/pages/SchemaValidatorPage"))
const TroubleshootingPage = lazy(() => import("@/pages/TroubleshootingPage"))

// Informatica, DB2 & Mainframe Enterprise Tools
const InformaticaXmlToSqlPage = lazy(() => import("@/pages/InformaticaXmlToSqlPage"))
const InformaticaExpressionTranspilerPage = lazy(() => import("@/pages/InformaticaExpressionTranspilerPage"))
const CobolCopybookConverterPage = lazy(() => import("@/pages/CobolCopybookConverterPage"))
const Db2SasDdlPage = lazy(() => import("@/pages/Db2SasDdlPage"))
const AqtSqlTranspilerPage = lazy(() => import("@/pages/AqtSqlTranspilerPage"))
const ProcedureToPysparkPage = lazy(() => import("@/pages/ProcedureToPysparkPage"))
const EnterpriseSqlWorkbenchPage = lazy(() => import("@/pages/EnterpriseSqlWorkbenchPage"))

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
    element: <LazyPage Component={LandingPage} variant="full" />,
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { path: "app", element: <LazyPage Component={HomePage} variant="home" /> },
      { path: "sql-sandbox", element: <LazyPage Component={SqlSandboxPage} variant="editor" /> },
      { path: "ddl-generator", element: <LazyPage Component={DdlGeneratorPage} variant="editor" /> },
      { path: "data-profiler", element: <LazyPage Component={DataProfilerPage} variant="full" /> },
      { path: "schema-diff", element: <LazyPage Component={SchemaDiffPage} variant="editor" /> },
      { path: "sql-formatter", element: <LazyPage Component={SqlFormatterPage} variant="editor" /> },
      { path: "code-library", element: <LazyPage Component={CodeLibraryPage} variant="grid" /> },
      { path: "etl-workflows", element: <LazyPage Component={EtlWorkflowsPage} variant="full" /> },
      { path: "performance-analyzer", element: <LazyPage Component={PerformanceAnalyzerPage} variant="full" /> },
      { path: "qa", element: <LazyPage Component={QAPage} variant="full" /> },
      { path: "schema-validator", element: <LazyPage Component={SchemaValidatorPage} variant="editor" /> },
      { path: "troubleshooting", element: <LazyPage Component={TroubleshootingPage} variant="full" /> },

      // Informatica, DB2 & Mainframe Enterprise Tools
      { path: "informatica-mapping-to-sql", element: <LazyPage Component={InformaticaXmlToSqlPage} variant="editor" /> },
      { path: "informatica-expression-transpiler", element: <LazyPage Component={InformaticaExpressionTranspilerPage} variant="editor" /> },
      { path: "cobol-copybook-converter", element: <LazyPage Component={CobolCopybookConverterPage} variant="editor" /> },
      { path: "db2-sas-ddl-generator", element: <LazyPage Component={Db2SasDdlPage} variant="editor" /> },
      { path: "aqt-sql-transpiler", element: <LazyPage Component={AqtSqlTranspilerPage} variant="editor" /> },
      { path: "db2-procedure-to-pyspark", element: <LazyPage Component={ProcedureToPysparkPage} variant="editor" /> },
      { path: "enterprise-sql-workbench", element: <LazyPage Component={EnterpriseSqlWorkbenchPage} variant="editor" /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
