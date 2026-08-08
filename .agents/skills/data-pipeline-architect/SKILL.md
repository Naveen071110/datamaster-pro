---
name: data-pipeline-architect
description: Enterprise ETL architecture, SQL optimization, PySpark/Airflow DAG patterns, schema drift analysis, and in-browser data engineering standards for DataMaster Pro.
---

# Data Pipeline Architect Skill

This skill provides specialized guidelines and standards for designing, auditing, and expanding DataMaster Pro's data engineering utilities, ETL pipeline visualizers, and SQL database toolsets.

## 🎯 Core Capabilities & Architecture Guidelines

### 1. In-Browser Data Processing & ETL Workflows
- **SQLite WebAssembly (WASM)**: Client-side SQL execution standards, memory-safe table instantiation, and multi-dialect schema extraction.
- **Apache Airflow & PySpark DAG Visualizer**: React Flow node graph design, DAG export patterns, dynamic task generation, and idempotent pipeline architecture.
- **DuckDB / Polars / dbt Snippet Vault**: Standardized production code snippets for data ingestion, window functions, and deduplication.

### 2. Multi-Dialect DDL & Schema Management
- **Dialect Translations**: Precise DDL translation rules across PostgreSQL, Snowflake, BigQuery, MySQL, SQLite, and Oracle.
- **Schema Drift & Migration**: Deterministic DDL parsing, structural diff detection (added/deleted/altered columns), and safe migration SQL script generation.
- **Statistical Data Profiling**: In-browser dataset profiling (type inference, null counts, distinct cardinality, distribution stats, and data quality alert rules).

### 3. Zero-Server Privacy Guarantee
- All CSV parsing, data profiling, SQL formatting, and schema diff operations MUST execute 100% client-side in the browser.
- Never transmit user datasets or SQL queries to external remote servers.
