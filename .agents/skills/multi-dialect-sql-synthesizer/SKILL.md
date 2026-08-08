---
name: multi-dialect-sql-synthesizer
description: Specialized skill for multi-dialect DDL generation (Postgres, Snowflake, BigQuery, MySQL, SQLite, Oracle), schema drift AST comparison, and SQL formatting.
---

# Multi-Dialect SQL Synthesizer & Schema Diff Skill

This skill provides operational workflows for generating, translating, diffing, and formatting SQL across enterprise database engine dialects in DataMaster Pro.

## 🛠 Supported Database Dialects
- **PostgreSQL**: `BIGSERIAL`, `TIMESTAMP WITH TIME ZONE`, `JSONB`, `UUID` primary keys.
- **Snowflake**: `NUMBER(38,0)`, `TIMESTAMP_NTZ`, `VARIANT`, cluster keys.
- **Google BigQuery**: `INT64`, `TIMESTAMP`, `JSON`, `PARTITION BY`, `CLUSTER BY`.
- **MySQL**: `AUTO_INCREMENT`, `DATETIME`, `JSON`, `ENGINE=InnoDB`.
- **SQLite**: `INTEGER PRIMARY KEY AUTOINCREMENT`, `TEXT`, `REAL`, `BLOB`.
- **Oracle**: `NUMBER`, `VARCHAR2`, `TIMESTAMP`, sequences & triggers.

## 🔄 Core Capabilities & Workflows

### 1. Dynamic DDL Synthesis
- Infer schema definitions automatically from CSV header rows and sample records.
- Support customizable table names, primary key selection, nullability constraints, and index generation per dialect.

### 2. Schema Drift & Diff Comparison
- Compare baseline DDL vs target DDL structurally (not just line-by-line text matching).
- Detect added columns, deleted columns, modified data types, and constraint changes.
- Generate valid, non-destructive migration SQL scripts (`ALTER TABLE ... ADD COLUMN`, `ALTER TABLE ... ALTER COLUMN`).

### 3. In-Browser SQL Formatting
- Parse and beautify raw SQL queries with customizable indentation, uppercase keyword rules (`SELECT`, `FROM`, `WHERE`, `JOIN`), and CTE formatting.
