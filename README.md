# ⚡ DataMaster Pro — Privacy-First Data Engineering Utility Suite

![DataMaster Pro Banner](https://img.shields.io/badge/DataMaster_Pro-18_Tool_Developer_Workbench-emerald?style=for-the-badge&logo=sqlite&logoColor=white)
![100% Client-Side](https://img.shields.io/badge/Privacy-100%25_In--Browser_WASM-blue?style=for-the-badge&logo=webassembly&logoColor=white)
![Deployment Status](https://img.shields.io/badge/Render-Live_Static_Site-success?style=for-the-badge&logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

> **DataMaster Pro** is a modern, privacy-first, 100% client-side developer utility suite built for **Data Engineers, Data Analysts, Informatica Developers, and Mainframe DB2 Professionals**. Execute SQL against raw CSVs in WebAssembly, generate multi-dialect DDL schemas, convert Informatica PowerCenter/IICS mappings to SQL, parse COBOL Copybooks, transpile AQT/DB2 scripts, profile datasets, diff database schemas, and debug production data pipelines — entirely inside your browser. Zero server uploads, no data storage, zero privacy risks.

---

## 🌐 Live Demo & Deployment

- **Live Render Web App**: [https://datamaster-pro-78m4.onrender.com](https://datamaster-pro-78m4.onrender.com/)
- **GitHub Repository**: [https://github.com/Naveen071110/datamaster-pro](https://github.com/Naveen071110/datamaster-pro)

---

## 🚀 The 18 Complete Developer Utilities

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              DATAMASTER PRO                                    │
│          The 18-Tool Privacy-First Workbench for Data Engineers                │
└────────────────────────────────────────────────────────────────────────────────┘
  │
  ├── 📊 1. Micro-SaaS Utilities Suite (7 Tools)
  │    ├── CSV & SQL Sandbox (SQLite WebAssembly Engine)
  │    ├── Multi-Dialect DDL Generator (Postgres, Snowflake, BigQuery, DB2, SQLite)
  │    ├── Data Profiler & Quality Health Inspector
  │    ├── Schema Diff & Drift Inspector (Auto ALTER TABLE Migration SQL)
  │    ├── SQL Formatter & Query Beautifier
  │    ├── Snippet Vault (50+ SQL, PySpark, Airflow, DuckDB, Polars, dbt)
  │    └── ETL Architecture DAG Builder (Visual ReactFlow Canvas)
  │
  ├── 🏛️ 2. Informatica, DB2 & Mainframe Enterprise Suite (7 Tools)
  │    ├── Informatica XML Mapping to SQL Converter (PowerCenter & IICS)
  │    ├── Informatica Expression Function Transpiler & Validator
  │    ├── COBOL Copybook to DB2 DDL & SAS Data Step Converter
  │    ├── IBM DB2 Mainframe DDL & SAS Script Synthesizer
  │    ├── AQT & DB2 Mainframe to Snowflake / Postgres Transpiler
  │    ├── DB2 & Oracle Stored Procedure to PySpark Converter
  │    └── Enterprise Window Function & MERGE (Upsert) Workbench
  │
  └── 🔍 3. Diagnostics & QA Suite (4 Tools)
       ├── Query Performance Analyzer & Execution Plan Hints
       ├── Schema Validator & Anti-Pattern Linter
       ├── Data QA Checks & Automated Assertion Suite
       └── Pipeline & SQL Debugger / Troubleshooting Guide
```

### 1. Micro-SaaS Utilities (7 Tools)
| Utility | Route | Key Capabilities |
| :--- | :--- | :--- |
| **CSV & SQL Sandbox** | `/sql-sandbox` | Upload custom `.csv` files or query mock datasets in-browser using SQLite WASM. Features Monaco Editor, schema explorer, and one-click export to CSV & JSON. |
| **CSV to DDL Generator** | `/ddl-generator` | Converts CSV rows or JSON objects into `CREATE TABLE` DDL & `INSERT INTO` statements across 5 database dialects (**PostgreSQL, Snowflake, BigQuery, MySQL, SQLite**). |
| **Data Profiler** | `/data-profiler` | Automated statistical health inspector calculating NULL rates, unique cardinalities, min/max/mean distributions, and flagging data quality alerts. |
| **Schema Diff Inspector** | `/schema-diff` | Side-by-side DDL schema comparator highlighting added (`+`), removed (`-`), and modified (`~`) columns + generating `ALTER TABLE` migration scripts. |
| **SQL Formatter** | `/sql-formatter` | Standardizes unformatted SQL statements, aligns query clauses, and configures keyword casing (UPPERCASE vs lowercase) with custom indentation. |
| **Snippet Vault** | `/code-library` | Searchable repository of 50+ production-tested code snippets covering SQL Window Functions, CTEs, Python ETL, PySpark DataFrames, and Airflow DAGs. |
| **ETL Architecture Builder** | `/etl-workflows` | Interactive ReactFlow visual canvas to design, visualize, and document data pipeline DAG architectures. |

---

### 2. Informatica, DB2 & Mainframe Enterprise Suite (7 Tools)
| Utility | Route | Key Capabilities |
| :--- | :--- | :--- |
| **Informatica XML to SQL** | `/informatica-mapping-to-sql` | Converts Informatica PowerCenter mapping `.xml` exports into precise, testable SQL CTE queries to validate data results before loading. |
| **Informatica Expression Transpiler** | `/informatica-expression-transpiler` | Validates and transpiles complex Informatica functions (`IIF`, `DECODE`, `ISNULL`, `ADD_TO_DATE`) into native database SQL. |
| **COBOL Copybook Converter** | `/cobol-copybook-converter` | Parses COBOL Copybook `PIC` definitions into IBM DB2 z/OS DDL tables and SAS `DATA` step import scripts. |
| **IBM DB2 & SAS DDL Synthesizer** | `/db2-sas-ddl-generator` | Constructs DB2 z/OS Storage Groups, Tablespaces (`LOCKSIZE ROW`, `COMPRESS YES`), EBCDIC DDLs, and SAS `PROC SQL` extract scripts. |
| **AQT & DB2 SQL Transpiler** | `/aqt-sql-transpiler` | Translates Advanced Query Tool (AQT) scripts and DB2 syntax (`FETCH FIRST`, `WITH RR`, `CURRENT DATE - YEARS`) into Snowflake, PostgreSQL, or BigQuery. |
| **DB2 Procedure to PySpark** | `/db2-procedure-to-pyspark` | Converts DB2 SQL PL stored procedures and Oracle PL/SQL blocks into Databricks PySpark DataFrame scripts. |
| **Enterprise Window & MERGE** | `/enterprise-sql-workbench` | Generates ANSI `MERGE INTO` (Upsert) queries and complex analytical Window Functions (`ROW_NUMBER`, `LAG/LEAD`, `SUM() OVER (...)`). |

---

### 3. Diagnostics & QA Suite (4 Tools)
| Utility | Route | Key Capabilities |
| :--- | :--- | :--- |
| **Query Performance Analyzer** | `/performance-analyzer` | Evaluates SQL execution plans, flags full table scans or Cartesian joins, and suggests performance optimizations. |
| **Schema Validator** | `/schema-validator` | Audits DDL schemas for anti-patterns, missing primary keys, unindexed foreign keys, and reserved column names. |
| **Data QA Assertion Suite** | `/qa` | Executes automated quality tests, column nullability validation, unique key constraint checks, and numeric range assertions. |
| **Pipeline Debugger** | `/troubleshooting` | Step-by-step diagnostic guide for WASM memory limits, query syntax errors, schema drift, and pipeline bottlenecks. |

---

## 🔒 Privacy & Security Guarantee

Enterprise data professionals deal with sensitive customer records, financial figures, and enterprise schema DDLs.

**DataMaster Pro is 100% Client-Side:**
- **Zero Server Uploads**: Your CSVs, SQL queries, Informatica XML mappings, and DB2 schemas **never leave your browser**.
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
  Made with ❤️ for Data Engineers, Data Analysts, Informatica & DB2 Mainframe Professionals worldwide.
</p>
