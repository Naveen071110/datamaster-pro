// src/shared/utils/seoData.ts

export interface RouteSEO {
  path: string
  title: string
  description: string
  keywords: string
  headingH1: string
  category: string
  schemaType?: "WebApplication" | "SoftwareApplication" | "FAQPage" | "WebSite"
  faqItems?: Array<{ question: string; answer: string }>
}

export const BASE_URL = "https://datamaster-pro-78m4.onrender.com"

export const SEO_ROUTES_MAP: Record<string, RouteSEO> = {
  "/": {
    path: "/",
    title: "DataMaster Pro — Privacy-First In-Browser Data Suite",
    description: "100% in-browser developer utility suite for data engineers. Query CSVs in SQLite WASM, generate DDL, transpile Informatica, build dbt models, and profile datasets.",
    keywords: "Data Engineering, In-Browser Tools, SQLite WASM, Snowflake COPY, dbt Models, Airflow DAGs, Informatica SQL Transpiler, DDL Generator, Data Profiler",
    headingH1: "In-Browser Developer Tools for Modern Data Engineers",
    category: "DeveloperApplication",
    schemaType: "WebApplication",
  },
  "/app": {
    path: "/app",
    title: "Developer Workbench Overview | DataMaster Pro",
    description: "Central command center with 19 in-browser developer utilities covering Snowflake ingestion, dbt models, Airflow DAGs, SQL WASM, and schema validation.",
    keywords: "Data Engineering Workbench, ETL Suite, Snowflake Stage, dbt Generator, Airflow Builder, SQL Sandbox",
    headingH1: "Data Engineering & ETL Developer Workbench",
    category: "DeveloperApplication",
    schemaType: "WebApplication",
  },
  "/sql-sandbox": {
    path: "/sql-sandbox",
    title: "In-Browser CSV & SQL WASM Sandbox | DataMaster Pro",
    description: "Upload local CSV files and execute instant ANSI SQL queries inside an in-browser SQLite WebAssembly engine. Zero server uploads, 100% private.",
    keywords: "SQL Sandbox, SQLite WASM, In-Browser SQL, Query CSV with SQL, Client-Side SQL Engine, SQL Tester",
    headingH1: "Interactive CSV & SQL WebAssembly Sandbox",
    category: "DatabaseApplication",
    schemaType: "SoftwareApplication",
  },
  "/ddl-generator": {
    path: "/ddl-generator",
    title: "CSV to Multi-Dialect DDL Generator | DataMaster Pro",
    description: "Convert CSV data into optimized CREATE TABLE DDL and INSERT statements across PostgreSQL, Snowflake, BigQuery, MySQL, and SQLite.",
    keywords: "CSV to DDL, CREATE TABLE Generator, Snowflake DDL, Postgres DDL, BigQuery DDL, SQL Schema Generator",
    headingH1: "CSV to Multi-Dialect DDL & Schema Generator",
    category: "DeveloperApplication",
    schemaType: "SoftwareApplication",
  },
  "/data-profiler": {
    path: "/data-profiler",
    title: "Automated Data Profiler & Quality Linter | DataMaster Pro",
    description: "Perform instant statistical dataset profiling: analyze null percentages, distinct cardinalities, value distributions, and data quality anomalies.",
    keywords: "Data Profiler, Data Quality Check, Dataset Health, Null Analysis, Column Cardinality, Data Cleaning Tool",
    headingH1: "Automated Dataset Profiler & Quality Inspector",
    category: "DataQualityApplication",
    schemaType: "SoftwareApplication",
  },
  "/test-data-generator": {
    path: "/test-data-generator",
    title: "Synthetic Mock Data Generator | DataMaster Pro",
    description: "Generate high-volume, realistic synthetic test datasets for users, e-commerce orders, companies, and financial ledgers with CSV & SQL exports.",
    keywords: "Mock Data Generator, Synthetic Test Data, Fake Data Generator, Relational Data Seeder, SQL Seed Data",
    headingH1: "High-Speed Synthetic Mock Data Generator",
    category: "DeveloperApplication",
    schemaType: "SoftwareApplication",
  },
  "/currency-converter": {
    path: "/currency-converter",
    title: "Live FX Rates & Currency Normalizer | DataMaster Pro",
    description: "Explore live exchange rates across 30+ global currencies, calculate triangular FX conversions, and generate SQL dim_exchange_rates DDL.",
    keywords: "Currency Converter, Live FX Rates, Exchange Rate Matrix, Foreign Exchange DDL, Currency Dimension Table",
    headingH1: "Live Foreign Exchange Rates & Currency Normalizer",
    category: "FinanceApplication",
    schemaType: "SoftwareApplication",
  },
  "/schema-diff": {
    path: "/schema-diff",
    title: "SQL Schema Diff & Migration Generator | DataMaster Pro",
    description: "Compare two SQL DDL schemas to identify added, dropped, or altered columns and automatically generate database ALTER TABLE migration scripts.",
    keywords: "Schema Diff, SQL Schema Comparison, Database Migration Generator, ALTER TABLE Generator, DDL Diff",
    headingH1: "SQL Schema Diff & Migration Script Generator",
    category: "DatabaseApplication",
    schemaType: "SoftwareApplication",
  },
  "/sql-formatter": {
    path: "/sql-formatter",
    title: "SQL Formatter & Query Beautifier | DataMaster Pro",
    description: "Format, beautify, and standardize unformatted SQL queries with customizable indentation, keyword uppercasing, and clause alignment.",
    keywords: "SQL Formatter, SQL Beautifier, SQL Pretty Print, Query Indentation, SQL Validator",
    headingH1: "Instant SQL Formatter & Query Beautifier",
    category: "DeveloperApplication",
    schemaType: "SoftwareApplication",
  },
  "/code-library": {
    path: "/code-library",
    title: "Data Engineering Code Snippet Vault | DataMaster Pro",
    description: "Search 50+ curated, production-ready code snippets across SQL window functions, Snowflake COPY commands, dbt incremental models, and PySpark.",
    keywords: "Data Engineering Snippets, SQL Snippet Library, Snowflake Code Templates, dbt Examples, Airflow Code",
    headingH1: "Data Engineering Code Snippets & Recipe Vault",
    category: "DeveloperApplication",
    schemaType: "SoftwareApplication",
  },
  "/etl-workflows": {
    path: "/etl-workflows",
    title: "Visual ETL Architecture & DAG Builder | DataMaster Pro",
    description: "Design and visualize data pipelines, ETL architectures, and DAG dependencies using an interactive node-based flow canvas.",
    keywords: "ETL Architecture, DAG Builder, Data Pipeline Designer, ETL Flow Canvas, Pipeline Diagram",
    headingH1: "Visual ETL Architecture & Pipeline DAG Designer",
    category: "WorkflowApplication",
    schemaType: "SoftwareApplication",
  },
  "/snowflake-stage-generator": {
    path: "/snowflake-stage-generator",
    title: "Snowflake Stage & COPY Synthesizer | DataMaster Pro",
    description: "Generate production Snowflake CREATE STAGE, FILE FORMAT, COPY INTO commands, and Snowpipe definitions for S3, Azure Blob, and Google Cloud Storage.",
    keywords: "Snowflake Stage Generator, Snowflake COPY INTO, Snowpipe DDL, Storage Integration Snowflake, S3 Snowflake Stage",
    headingH1: "Snowflake Stage, COPY INTO & Snowpipe Generator",
    category: "CloudDataApplication",
    schemaType: "SoftwareApplication",
  },
  "/dbt-model-generator": {
    path: "/dbt-model-generator",
    title: "dbt Model & Schema.yml Synthesizer | DataMaster Pro",
    description: "Generate structured dbt staging/marts SQL models with Jinja config blocks, CTE layouts, and complete schema.yml documentation with column tests.",
    keywords: "dbt Model Generator, dbt schema.yml Generator, dbt Staging Models, dbt Incremental Config, dbt YAML",
    headingH1: "dbt Model & Schema.yml Documentation Synthesizer",
    category: "DeveloperApplication",
    schemaType: "SoftwareApplication",
  },
  "/airflow-dag-generator": {
    path: "/airflow-dag-generator",
    title: "Airflow 2.x Python DAG Generator | DataMaster Pro",
    description: "Create production-ready Apache Airflow 2.x Python DAG scripts with TaskFlow API, BashOperator, PythonOperator, cron schedules, and task dependencies.",
    keywords: "Airflow DAG Generator, Apache Airflow Python DAG, TaskFlow API, Airflow Schedule Cron, Airflow Python Script",
    headingH1: "Apache Airflow 2.x Python DAG Generator",
    category: "WorkflowApplication",
    schemaType: "SoftwareApplication",
  },
  "/informatica-mapping-to-sql": {
    path: "/informatica-mapping-to-sql",
    title: "Informatica XML to Cloud SQL Converter | DataMaster Pro",
    description: "Upload Informatica PowerCenter XML mapping exports and automatically convert transformations into modular CTE SQL for Snowflake, BigQuery, and Postgres.",
    keywords: "Informatica to SQL, PowerCenter XML to SQL, Informatica Migration, ETL Modernization, Informatica to Snowflake",
    headingH1: "Informatica PowerCenter XML to Cloud SQL Converter",
    category: "MigrationApplication",
    schemaType: "SoftwareApplication",
  },
  "/informatica-expression-transpiler": {
    path: "/informatica-expression-transpiler",
    title: "Informatica Expression Transpiler | DataMaster Pro",
    description: "Transpile Informatica PowerCenter expressions (IIF, DECODE, ISNULL, ADD_TO_DATE, SUBSTR) into native ANSI SQL across Snowflake, BigQuery, and DB2.",
    keywords: "Informatica Expression Transpiler, IIF to CASE WHEN, DECODE to CASE, ADD_TO_DATE SQL, Informatica Function Converter",
    headingH1: "Informatica Expression to Native SQL Transpiler",
    category: "DeveloperApplication",
    schemaType: "SoftwareApplication",
  },
  "/performance-analyzer": {
    path: "/performance-analyzer",
    title: "SQL Query Performance & Index Analyzer | DataMaster Pro",
    description: "Analyze SQL queries for full table scans, Cartesian product JOINs, unindexed WHERE clauses, and get actionable performance tuning recommendations.",
    keywords: "SQL Performance Analyzer, Query Optimizer, Index Recommendations, SQL Tuning, Database Performance",
    headingH1: "SQL Query Performance & Optimization Analyzer",
    category: "DatabaseApplication",
    schemaType: "SoftwareApplication",
  },
  "/schema-validator": {
    path: "/schema-validator",
    title: "JSON & CSV Schema Validator & Linter | DataMaster Pro",
    description: "Validate JSON and CSV payloads against JSON Schema specifications with detailed error reports, type checking, and format validation.",
    keywords: "Schema Validator, JSON Schema Validator, CSV Schema Linter, Data Payload Validator, Schema Conformance",
    headingH1: "JSON & CSV Schema Validator and Payload Linter",
    category: "DataQualityApplication",
    schemaType: "SoftwareApplication",
  },
  "/qa": {
    path: "/qa",
    title: "Data Engineering QA & Interview Hub | DataMaster Pro",
    description: "Master data engineering concepts with 40+ comprehensive architectural questions, interview answers, and best practices for modern data teams.",
    keywords: "Data Engineering Interview Questions, Data Architecture QA, SQL Interview Prep, Data Warehouse Best Practices",
    headingH1: "Data Engineering QA, Assertions & Interview Hub",
    category: "EducationalApplication",
    schemaType: "FAQPage",
    faqItems: [
      {
        question: "How does SQLite WASM execute queries in the browser?",
        answer: "SQLite WebAssembly is compiled directly from C source code to WebAssembly bytecode. It runs directly inside the browser's JavaScript V8/SpiderMonkey engine in a secure, isolated sandbox with zero server communication."
      },
      {
        question: "Is my uploaded CSV data stored on any remote server?",
        answer: "No. DataMaster Pro is strictly privacy-first. All CSV parsing, data profiling, DDL synthesis, and SQL queries happen 100% locally in your browser memory."
      },
      {
        question: "Which cloud data warehouses are supported for DDL and Stage generation?",
        answer: "DataMaster Pro supports Snowflake, Google BigQuery, PostgreSQL, MySQL, SQLite, and IBM DB2."
      }
    ]
  },
  "/troubleshooting": {
    path: "/troubleshooting",
    title: "Pipeline & SQL Debugging Guide | DataMaster Pro",
    description: "Interactive decision-tree troubleshooting guide for diagnosing SQL execution failures, pipeline latency, WASM memory errors, and ETL bottlenecks.",
    keywords: "Pipeline Troubleshooting, SQL Debugger, ETL Error Resolver, Data Warehouse Bottlenecks, WASM Memory Fixes",
    headingH1: "Interactive Pipeline & SQL Troubleshooting Debugger",
    category: "DeveloperApplication",
    schemaType: "FAQPage",
    faqItems: [
      {
        question: "How do I resolve out-of-memory errors when querying large CSVs?",
        answer: "For datasets larger than 100MB, profile column schemas first, filter unnecessary columns, or use chunked batching."
      },
      {
        question: "How to fix Cartesian product warnings in SQL queries?",
        answer: "Ensure every JOIN clause includes explicit ON conditions matching primary and foreign keys."
      }
    ]
  },
  "/db2-sas-ddl-generator": {
    path: "/db2-sas-ddl-generator",
    title: "DB2 & SAS Parameter Resolver | DataMaster Pro",
    description: "Substitute DB2 host variables (:dept_no) and SAS macro variables (&START_DT) with parameter file key-value pairs into runnable SQL queries.",
    keywords: "DB2 Parameter Resolver, SAS Macro Variable Resolver, Host Variable Substitution, DB2 SQL Generator",
    headingH1: "DB2 & SAS Host Variable & Parameter Resolver",
    category: "DeveloperApplication",
    schemaType: "SoftwareApplication",
  },
}

export function getSEOData(pathname: string): RouteSEO {
  const normalized = pathname === "" || pathname === "/" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`
  return (
    SEO_ROUTES_MAP[normalized] || {
      path: normalized,
      title: "DataMaster Pro — In-Browser Data Engineering Suite",
      description: "100% in-browser developer utility suite for data engineers. Query CSVs in SQLite WASM, generate DDL, transpile Informatica, and profile data.",
      keywords: "Data Engineering, In-Browser Tools, SQLite WASM, Snowflake, dbt, Airflow",
      headingH1: "Data Engineering Developer Suite",
      category: "DeveloperApplication",
      schemaType: "WebApplication",
    }
  )
}
