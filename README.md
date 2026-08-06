# ⚡ DataMaster Pro — Privacy-First Data Engineering Utility Suite

![DataMaster Pro Banner](https://img.shields.io/badge/DataMaster_Pro-Micro--SaaS_Suite-emerald?style=for-the-badge&logo=sqlite&logoColor=white)
![100% Client-Side](https://img.shields.io/badge/Privacy-100%25_In--Browser_WASM-blue?style=for-the-badge&logo=webassembly&logoColor=white)
![Deployment Status](https://img.shields.io/badge/Render-Live_Static_Site-success?style=for-the-badge&logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

> **DataMaster Pro** is a modern, privacy-first, 100% client-side developer utility suite built for **Data Engineers & Data Analysts**. Execute SQL against raw CSVs in WebAssembly, generate multi-dialect DDL schemas, profile datasets, diff database schemas, and beautify production SQL queries — entirely inside your browser. No server uploads, no data storage, zero privacy risks.

---

## 🌐 Live Demo & Deployment

- **Live Render Web App**: [https://datamaster-pro-78m4.onrender.com](https://datamaster-pro-78m4.onrender.com/)
- **GitHub Repository**: [https://github.com/Naveen071110/datamaster-pro](https://github.com/Naveen071110/datamaster-pro)

---

## 📌 Recommended GitHub Repository 'About' Setup

To set up your GitHub repository homepage metadata:

1. Go to [github.com/Naveen071110/datamaster-pro](https://github.com/Naveen071110/datamaster-pro).
2. Click the ⚙️ **gear icon** next to **About** on the top right.
3. Paste the following details:
   - **Description**: `⚡ Privacy-first, 100% in-browser developer utility suite for Data Engineers & Analysts. Features SQLite WASM CSV sandbox, multi-dialect DDL generator, data profiler, schema diff, SQL beautifier, snippet vault, and visual ETL DAG builder.`
   - **Website**: `https://datamaster-pro.onrender.com`
   - **Topics**: `data-engineering`, `data-analyst`, `sqlite-wasm`, `ddl-generator`, `sql-formatter`, `data-profiler`, `schema-diff`, `micro-saas`, `privacy-first`, `react`, `typescript`, `vite`, `tailwind-css`

---

## 🚀 The 7 Core Utilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DATAMASTER PRO                                │
│       The Privacy-First Developer Utility Suite for Data Pros          │
└────────────────────────────────────────────────────────────────────────┘
  │
  ├── 📊 1. CSV & SQL Sandbox (Query any CSV in Browser via SQLite WASM)
  ├── ⚡ 2. CSV to Multi-Dialect DDL Generator (Postgres, Snowflake, BigQuery)
  ├── 🔍 3. Data Profiler & Quality Health Check
  ├── 📐 4. Schema Diff & Drift Inspector (Auto ALTER TABLE Migration SQL)
  ├── 🔄 5. SQL Formatter & Query Beautifier
  ├── 🛠️ 6. Snippet Vault (50+ Production SQL, Python, PySpark, Airflow)
  └── 🗺️ 7. ETL Pipeline Architecture Builder (Visual ReactFlow Canvas)
```

| Utility | Route | Key Capabilities |
| :--- | :--- | :--- |
| **1. CSV & SQL Sandbox** | `/sql-sandbox` | Upload custom `.csv` files or query mock datasets in-browser using SQLite WASM. Features Monaco Editor, schema explorer, and one-click export to CSV & JSON. |
| **2. CSV to DDL Generator** | `/ddl-generator` | Converts CSV rows or JSON objects into `CREATE TABLE` DDL & `INSERT INTO` statements across 5 database dialects (**PostgreSQL, Snowflake, BigQuery, MySQL, SQLite**). |
| **3. Data Profiler** | `/data-profiler` | Automated statistical health inspector calculating NULL rates, unique cardinalities, min/max/mean distributions, and flagging data quality alerts. |
| **4. Schema Diff Inspector** | `/schema-diff` | Side-by-side DDL schema comparator highlighting added (`+`), removed (`-`), and modified (`~`) columns + generating `ALTER TABLE` migration scripts. |
| **5. SQL Formatter** | `/sql-formatter` | Standardizes unformatted SQL statements, aligns query clauses, and configures keyword casing (UPPERCASE vs lowercase) with custom indentation. |
| **6. Snippet Vault** | `/code-library` | Searchable repository of 50+ production-tested code snippets covering SQL Window Functions, CTEs, Python ETL, PySpark DataFrames, and Airflow DAGs. |
| **7. ETL Architecture Builder** | `/etl-workflows` | Interactive ReactFlow visual canvas to design, visualize, and document data pipeline DAG architectures. |

---

## 🔒 Privacy & Security Guarantee

Enterprise data professionals deal with sensitive customer records, financial figures, and enterprise schema DDLs.

**DataMaster Pro is 100% Client-Side:**
- **Zero Server Uploads**: Your CSVs, SQL queries, and schemas **never leave your browser**.
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

To run DataMaster Pro locally on your system:

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Clone Repository
```bash
git clone https://github.com/Naveen071110/datamaster-pro.git
cd datamaster-pro
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Local Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
The optimized static production bundle will be generated in the `dist/` directory.

---

## ☁️ Render Deployment Guide

This repository includes a [`render.yaml`](render.yaml) file for instant zero-configuration deployment on **Render**:

1. Log into your **[Render Dashboard](https://dashboard.render.com)**.
2. Click **New +** → select **Static Site**.
3. Connect your GitHub repository (`Naveen071110/datamaster-pro`).
4. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Click **Create Static Site**.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center>
  Made with ❤️ for Data Engineers & Data Analysts worldwide.
</p>
