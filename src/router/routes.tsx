import { lazy, Suspense } from "react"
import { createBrowserRouter, type RouteObject } from "react-router-dom"
import AppShell from "@/layouts/AppShell"
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton"
import { RootErrorBoundary } from "@/shared/components/RootErrorBoundary"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const HomePage = lazy(() => import("@/pages/HomePage"))
const SqlSandboxPage = lazy(() => import("@/pages/SqlSandboxPage"))
const DdlGeneratorPage = lazy(() => import("@/pages/DdlGeneratorPage"))
const DataProfilerPage = lazy(() => import("@/pages/DataProfilerPage"))
const TestDataGeneratorPage = lazy(() => import("@/pages/TestDataGeneratorPage"))
const CurrencyRatesPage = lazy(() => import("@/pages/CurrencyRatesPage"))
const SchemaDiffPage = lazy(() => import("@/pages/SchemaDiffPage"))
const SqlFormatterPage = lazy(() => import("@/pages/SqlFormatterPage"))
const CodeLibraryPage = lazy(() => import("@/pages/CodeLibraryPage"))
const EtlWorkflowsPage = lazy(() => import("@/pages/EtlWorkflowsPage"))
const PerformanceAnalyzerPage = lazy(() => import("@/pages/PerformanceAnalyzerPage"))
const QAPage = lazy(() => import("@/pages/QAPage"))
const SchemaValidatorPage = lazy(() => import("@/pages/SchemaValidatorPage"))
const TroubleshootingPage = lazy(() => import("@/pages/TroubleshootingPage"))

// ETL & Cloud Data Suite (Informatica, Snowflake, dbt, Airflow, DB2)
const InformaticaXmlToSqlPage = lazy(() => import("@/pages/InformaticaXmlToSqlPage"))
const InformaticaExpressionTranspilerPage = lazy(() => import("@/pages/InformaticaExpressionTranspilerPage"))
const SnowflakeStageGeneratorPage = lazy(() => import("@/pages/SnowflakeStageGeneratorPage"))
const DbtModelGeneratorPage = lazy(() => import("@/pages/DbtModelGeneratorPage"))
const AirflowDagGeneratorPage = lazy(() => import("@/pages/AirflowDagGeneratorPage"))
const Db2SasDdlPage = lazy(() => import("@/pages/Db2SasDdlPage"))
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"))
const TermsPage = lazy(() => import("@/pages/TermsPage"))
const ContactPage = lazy(() => import("@/pages/ContactPage"))
const ThankYouPage = lazy(() => import("@/pages/ThankYouPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

function LazyPage({ Component, variant }: { Component: React.ComponentType; variant?: "home" | "full" | "grid" | "list" | "editor" }) {
  return (
    <Suspense fallback={<LoadingSkeleton variant={variant || "full"} />}>
      <Component />
    </Suspense>
  )
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <LazyPage Component={LandingPage} variant="full" />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: "/",
    element: <AppShell />,
    errorElement: <RootErrorBoundary />,
    children: [
      { path: "app", element: <LazyPage Component={HomePage} variant="home" /> },
      
      // Micro-SaaS Tools
      { path: "sql-sandbox", element: <LazyPage Component={SqlSandboxPage} variant="editor" /> },
      { path: "ddl-generator", element: <LazyPage Component={DdlGeneratorPage} variant="editor" /> },
      { path: "data-profiler", element: <LazyPage Component={DataProfilerPage} variant="full" /> },
      { path: "test-data-generator", element: <LazyPage Component={TestDataGeneratorPage} variant="full" /> },
      { path: "currency-converter", element: <LazyPage Component={CurrencyRatesPage} variant="full" /> },
      { path: "schema-diff", element: <LazyPage Component={SchemaDiffPage} variant="editor" /> },
      { path: "sql-formatter", element: <LazyPage Component={SqlFormatterPage} variant="editor" /> },
      { path: "code-library", element: <LazyPage Component={CodeLibraryPage} variant="grid" /> },
      { path: "etl-workflows", element: <LazyPage Component={EtlWorkflowsPage} variant="full" /> },

      // ETL & Cloud Data Suite (Informatica, Snowflake, dbt, Airflow)
      { path: "informatica-mapping-to-sql", element: <LazyPage Component={InformaticaXmlToSqlPage} variant="editor" /> },
      { path: "informatica-expression-transpiler", element: <LazyPage Component={InformaticaExpressionTranspilerPage} variant="editor" /> },
      { path: "snowflake-stage-generator", element: <LazyPage Component={SnowflakeStageGeneratorPage} variant="editor" /> },
      { path: "dbt-model-generator", element: <LazyPage Component={DbtModelGeneratorPage} variant="editor" /> },
      { path: "airflow-dag-generator", element: <LazyPage Component={AirflowDagGeneratorPage} variant="editor" /> },

      // Diagnostics & QA
      { path: "performance-analyzer", element: <LazyPage Component={PerformanceAnalyzerPage} variant="full" /> },
      { path: "qa", element: <LazyPage Component={QAPage} variant="full" /> },
      { path: "schema-validator", element: <LazyPage Component={SchemaValidatorPage} variant="editor" /> },
      { path: "troubleshooting", element: <LazyPage Component={TroubleshootingPage} variant="full" /> },
      { path: "db2-sas-ddl-generator", element: <LazyPage Component={Db2SasDdlPage} variant="editor" /> },

      // Legal & Support
      { path: "privacy", element: <LazyPage Component={PrivacyPage} variant="full" /> },
      { path: "terms", element: <LazyPage Component={TermsPage} variant="full" /> },
      { path: "contact", element: <LazyPage Component={ContactPage} variant="full" /> },
      { path: "thank-you", element: <LazyPage Component={ThankYouPage} variant="full" /> },
      { path: "404", element: <LazyPage Component={NotFoundPage} variant="full" /> },

      { path: "*", element: <LazyPage Component={NotFoundPage} variant="full" /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
