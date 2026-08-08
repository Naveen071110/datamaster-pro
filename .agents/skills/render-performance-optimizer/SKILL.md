---
name: render-performance-optimizer
description: Render.com production build optimization, Vite bundle splitting, WebAssembly binary serving, CloudFront CDN video scrubbing performance, and 60fps UI frame rate tuning.
---

# Render & Web Performance Optimizer Skill

This skill provides operational workflows for optimizing production builds deployed on Render.com, maintaining smooth background video scrubbing, and keeping bundle sizes minimal for DataMaster Pro.

## 🚀 Key Performance Standards

### 1. Render.com Build & Deployment Config (`render.yaml`)
- Build command: `npm run build` (`tsc -b && vite build`).
- Ensure WASM files (`sql-wasm.wasm`) are properly served with `application/wasm` MIME headers in production distribution.
- Zero-warning TypeScript compilation (`npx tsc --noEmit`).

### 2. Video Scrubbing Engine Optimization (`ScrollVideo.tsx`)
- Native GPU hardware-accelerated HTML5 `<video>` scrubbing with `object-cover`.
- `crossOrigin="anonymous"` set on video assets to eliminate cross-origin canvas security taints.
- Single `requestAnimationFrame` loop guarded by `hasStarted` flag to prevent frame stutter.
- High-refresh rate (120Hz/144Hz) 40ms seek safety timeout.
- 4-second mobile network timeout fallback poster image.

### 3. Code Splitting & Chunking (`vite.config.ts`)
- Lazy load major routes (`LandingPage`, `HomePage`, `SqlSandboxPage`, `EtlWorkflowsPage`, `CodeLibraryPage`).
- Separate vendor chunks (`react-vendor`, `ui-vendor`, `sql-wasm-browser`).
