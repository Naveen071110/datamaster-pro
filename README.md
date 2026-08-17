# ⚡ DataMaster Pro — Privacy-First Data Engineering Utility Suite

![DataMaster Pro Banner](https://img.shields.io/badge/DataMaster_Pro-19_Tool_Developer_Workbench-emerald?style=for-the-badge&logo=sqlite&logoColor=white)
![100% Client-Side](https://img.shields.io/badge/Privacy-100%25_In--Browser_WASM-blue?style=for-the-badge&logo=webassembly&logoColor=white)
![Deployment Status](https://img.shields.io/badge/Render-Live_Static_Site-success?style=for-the-badge&logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

> **DataMaster Pro** is a modern, privacy-first, 100% client-side developer utility suite built for **Data Engineers, Analytics Engineers, dbt Developers, Snowflake Architects, and ETL Specialists**. Execute SQL against raw CSVs in WebAssembly, generate multi-dialect DDL schemas, synthesize mock test data, build Snowflake stages and COPY pipelines, synthesize dbt SQL models and `schema.yml` tests, construct Apache Airflow Python DAGs, convert Informatica PowerCenter/IICS mappings to SQL, profile datasets, diff database schemas, and debug production data pipelines — entirely inside your browser. Zero server uploads, no data storage, zero privacy risks.

---

## 🌐 Live Demo & Deployment

- **Live Render Web App**: [https://datamaster-pro-78m4.onrender.com](https://datamaster-pro-78m4.onrender.com/)
- **GitHub Repository**: [https://github.com/Naveen071110/datamaster-pro](https://github.com/Naveen071110/datamaster-pro)

---

## 🚀 The 19 Complete Developer Utilities

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              DATAMASTER PRO                                    │
│          The 19-Tool Privacy-First Workbench for Data Engineers                │
└────────────────────────────────────────────────────────────────────────────────┘
  │
  ├── 📊 1. Micro-SaaS Utilities Suite (9 Tools)
  │    ├── CSV & SQL Sandbox (SQLite WebAssembly Engine)
  │    ├── Multi-Dialect DDL Generator (Postgres, Snowflake, BigQuery, MySQL, SQLite)
  │    ├── Data Profiler & Quality Health Inspector
  │    ├── Synthetic Mock Data Generator (Local, DummyJSON, RandomUser.me, ISO Geo)
  │    ├── Live FX Rates & Currency Normalizer (ECB Reference Rates & dim_exchange_rates DDL)
  │    ├── Schema Diff & Drift Inspector (Auto ALTER TABLE Migration SQL)
  │    ├── SQL Formatter & Query Beautifier
  │    ├── Snippet Vault (50+ SQL, PySpark, Airflow, DuckDB, Polars, dbt)
  │    └── ETL Architecture DAG Builder (Visual ReactFlow Canvas)
  │
  ├── 🔷 2. ETL & Cloud Data Suite (5 Tools)
  │    ├── Snowflake Stage & COPY Ingestion Synthesizer (S3, Azure, GCS + Snowpipe & Cost Calculator)
  │    ├── dbt Model & YAML Schema Synthesizer (CTE ref/source models + automated test generation)
  │    ├── Apache Airflow Python DAG Generator (Operator chains >> + Cron schedule validation)
  │    ├── Informatica XML Mapping to SQL Converter (PowerCenter & IICS + .par parameter binder)
  │    └── Informatica Expression Function Transpiler & Validator
  │
  └── 🔍 3. Diagnostics & QA Suite (5 Tools)
       ├── Query Performance Analyzer & Execution Plan Hints
       ├── Schema Validator & Anti-Pattern Linter
       ├── Data QA Checks & Automated Assertion Suite
       ├── Pipeline & SQL Debugger / Troubleshooting Guide
       └── DB2 & SAS Parameter File Resolver
```

### 1. Micro-SaaS Utilities (9 Tools)
| Utility | Route | Key Capabilities |
| :--- | :--- | :--- |
| **CSV & SQL Sandbox** | `/sql-sandbox` | Upload custom `.csv` files or query mock datasets in-browser using SQLite WASM. Features Monaco Editor, schema explorer, and one-click export to CSV & JSON. |
| **CSV to DDL Generator** | `/ddl-generator` | Converts CSV rows or JSON objects into `CREATE TABLE` DDL & `INSERT INTO` statements across 5 database dialects (**PostgreSQL, Snowflake, BigQuery, MySQL, SQLite**). |
| **Data Profiler** | `/data-profiler` | Automated statistical health inspector calculating NULL rates, unique cardinalities, min/max/mean distributions, and flagging data quality alerts. |
| **Synthetic Mock Data Generator** | `/test-data-generator` | Generates realistic synthetic datasets (Users, Orders, Companies, Financial Ledgers, Server Logs, DummyJSON, RandomUser) with instant export to CSV, JSON, or SQL inserts. |
| **Live FX Rates & Currency Normalizer** | `/currency-converter` | Real-time foreign exchange converter across 30+ currencies with automated `dim_exchange_rates` DDL generation for ETL pipelines. |
| **Schema Diff Inspector** | `/schema-diff` | Side-by-side DDL schema comparator highlighting added (`+`), removed (`-`), and modified (`~`) columns + generating `ALTER TABLE` migration scripts. |
| **SQL Formatter** | `/sql-formatter` | Standardizes unformatted SQL statements, aligns query clauses, and configures keyword casing (UPPERCASE vs lowercase) with custom indentation. |
| **Snippet Vault** | `/code-library` | Searchable repository of 50+ production-tested code snippets covering SQL Window Functions, CTEs, Python ETL, PySpark DataFrames, and Airflow DAGs. |
| **ETL Architecture Builder** | `/etl-workflows` | Interactive ReactFlow visual canvas to design, visualize, and document data pipeline DAG architectures. |

---

### 2. ETL & Cloud Data Suite (5 Tools)
| Utility | Route | Key Capabilities |
| :--- | :--- | :--- |
| **Snowflake Stage & COPY Synthesizer** | `/snowflake-stage-generator` | Generates external/internal stages (S3, Azure, GCS), file formats (`PARQUET`, `CSV`, `JSON`), `COPY INTO` pipelines, Snowpipe DDLs, and computes warehouse credit costs. |
| **dbt Model & Schema Synthesizer** | `/dbt-model-generator` | Generates enterprise dbt SQL models with `{{ source() }}` and `{{ ref() }}`, incremental hooks, and companion `schema.yml` files with automated quality tests. |
| **Airflow Python DAG Generator** | `/airflow-dag-generator` | Builds Airflow 2.x Python DAG scripts with `PythonOperator`, `BashOperator`, `SnowflakeOperator`, task dependency chains (`>>`), and cron schedule validation. |
| **Informatica XML to SQL** | `/informatica-mapping-to-sql` | Converts Informatica PowerCenter mapping `.xml` exports into precise, testable SQL CTE queries and binds parameter files (`.par` / `$$PARAM`) into executable SQL. |
| **Informatica Expression Transpiler** | `/informatica-expression-transpiler` | Validates and transpiles complex Informatica functions (`IIF`, `DECODE`, `ISNULL`, `ADD_TO_DATE`) into native database SQL. |

---

### 3. Diagnostics & QA Suite (5 Tools)
| Utility | Route | Key Capabilities |
| :--- | :--- | :--- |
| **Query Performance Analyzer** | `/performance-analyzer` | Evaluates SQL execution plans, flags full table scans or Cartesian joins, and suggests performance optimizations. |
| **Schema Validator** | `/schema-validator` | Audits DDL schemas for anti-patterns, missing primary keys, unindexed foreign keys, and reserved column names. |
| **Data QA Assertion Suite** | `/qa` | Executes automated quality tests, column nullability validation, unique key constraint checks, and numeric range assertions. |
| **Pipeline Debugger** | `/troubleshooting` | Step-by-step diagnostic guide for WASM memory limits, query syntax errors, schema drift, and pipeline bottlenecks. |
| **DB2 & SAS Parameter Resolver** | `/db2-sas-ddl-generator` | Replaces DB2 host variables (`:param`) and SAS macros (`&macro`) with parameter file values into runnable production queries. |

---

## 🔒 Privacy & Security Guarantee

Enterprise data professionals deal with sensitive customer records, financial figures, and enterprise schema DDLs.

**DataMaster Pro is 100% Client-Side:**
- **Zero Server Uploads**: Your CSVs, SQL queries, dbt models, Snowflake stages, and Informatica XML mappings **never leave your browser**.
- **Local WebAssembly Engine**: Database operations are powered by SQLite WebAssembly compiled to pure JavaScript.
- **No Analytics / No Tracking**: All data processing is isolated inside your browser's local memory.

---

## 🛠️ Tech Stack

- **Framework**: React 18, TypeScript 5.6, Vite 6
- **Styling**: Tailwind CSS 3.4, Radix UI Primitive Components
- **In-Browser Database**: `sql.js` (SQLite compiled to WebAssembly)
- **Editors & Visuals**: Monaco Editor (`@monaco-editor/react`), ReactFlow (`reactflow`)
- **Icons**: Lucide React (`lucide-react`)
- **Deployment**: Render Static Site (with `render.yaml` and SPA fallback routing)

---

## 💻 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Naveen071110/datamaster-pro.git
cd datamaster-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Local Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ for Data Engineers, Analytics Engineers, Snowflake, dbt & Airflow Developers worldwide.
</p>
