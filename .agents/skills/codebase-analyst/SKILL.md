---
name: codebase-analyst
description: Architecture auditing, component structure mapping, script discovery, and AGENTS.md / CLAUDE.md specification generation for DataMaster Pro.
---

# Codebase & Architecture Analyst Skill

This skill provides procedures for auditing DataMaster Pro's repository, verifying TypeScript build configs, mapping route structures, and maintaining zero-drift multi-agent specifications.

## 🎯 Repository Verification Protocol

### 1. Stack & Runtime Truth
- **Framework**: React 18, Vite 6, TypeScript 5, React Router 6.
- **State Management**: Zustand stores (`src/stores/`).
- **Database Engine**: `sql.js` (SQLite compiled to WASM).
- **Styling**: Tailwind CSS + Lucide React + Monaco Editor.

### 2. Execution Script Map
- `npm run dev`: Starts Vite local development server.
- `npm run build`: Executes `tsc -b && vite build` for production.
- `npx tsc --noEmit`: Type checks without emitting JS assets.

### 3. Route Hierarchy
- `/`: `LandingPage.tsx` (Scroll video, hero section, capabilities overview).
- `/app`: `HomePage.tsx` (Workbench overview, tool launch cards).
- `/sql-sandbox`: `SqlSandboxPage.tsx` (In-browser WASM SQL execution).
- `/ddl-generator`: `DdlGeneratorPage.tsx` (CSV to multi-dialect DDL).
- `/data-profiler`: `DataProfilerPage.tsx` (Dataset statistics & alerts).
- `/schema-diff`: `SchemaDiffPage.tsx` (DDL comparison & migration SQL).
- `/sql-formatter`: `SqlFormatterPage.tsx` (Beautifier & query format).
- `/code-library`: `CodeLibraryPage.tsx` (Data engineering snippet vault).
- `/etl-workflows`: `EtlWorkflowsPage.tsx` (React Flow DAG visualizer).
