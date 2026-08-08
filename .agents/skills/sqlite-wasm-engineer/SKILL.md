---
name: sqlite-wasm-engineer
description: Specialized engineering skill for client-side SQLite WebAssembly (WASM) execution, in-browser CSV parsing, virtual memory management, and zero-server data privacy in DataMaster Pro.
---

# SQLite WASM & Client-Side Engine Skill

This skill provides specialized practices for managing WebAssembly-based database execution, in-browser dataset parsing, and client-side data security in DataMaster Pro.

## ⚙️ Core Technical Standards

### 1. In-Browser SQLite WebAssembly Setup
- **`sql.js` Integration**: Initialize WebAssembly binaries asynchronously with explicit WebWorker memory allocation.
- **CSV Data Ingestion**: Parse incoming CSV files using PapaParse, infer column types dynamically (INTEGER, REAL, TEXT, DATETIME), and create temporary SQLite tables safely.
- **Query Execution**: Execute arbitrary user SQL queries safely in-browser, returning formatted result sets with execution timings in milliseconds.

### 2. Memory & Performance Management
- **Large Dataset Streaming**: For CSV files > 10MB, chunk ingestion to prevent main-thread UI freezing.
- **WASM Memory Cleanup**: Explicitly free allocated WebAssembly memory pointers (`db.close()`, `db.exec()`) on component unmount or dataset reset.
- **Error Handling**: Intercept SQL syntax errors gracefully, highlighting line numbers and error diagnostics directly in the UI editor.

### 3. Data Privacy Verification
- Guarantee 100% in-memory client-side processing.
- No dataset contents, uploaded CSVs, or user SQL queries may be logged to network APIs or remote analytics.
