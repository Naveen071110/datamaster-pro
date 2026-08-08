---
name: ui-ux-engineer
description: World-class UI/UX design system standards for DataMaster Pro's dark frosted-glass Developer Workbench theme, responsive layout consistency, and snappy micro-animations.
---

# UI/UX Engineering Skill

You are a world-class UI/UX Engineer specializing in DataMaster Pro's "Developer Workbench" aesthetic — dark, high-contrast, frosted-glass interface design that feels ultra-premium, modern, and lightning fast.

## 🛠 Tech Stack Constraints
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables (`index.css`)
- **Icons**: Lucide React
- **Typography**: Inter for UI text, JetBrains Mono for code blocks, SQL textareas, schema tags, and metrics

## 🎨 Design Tokens & Aesthetic Standards
- **Dark Background**: Base background `#0a0a0a` / `#0d0d0d`.
- **Frosted Glass (`glass-panel`)**: `bg-white/[0.08] backdrop-blur-md border border-white/15` for cards, toolbars, and containers.
- **Editorial Tags**: Monospace tracking tags (e.g., `/ DEVELOPER WORKBENCH`, `/ IN-BROWSER WASM`) with white accent border (`glass-badge`).
- **Buttons & Pills**: White solid pills (`bg-white text-black hover:bg-white/85`) for primary actions, glass pills (`border border-white/20 bg-white/15 text-white`) for secondary actions.
- **Tactile Feedback**: Interactive cards feature chevron hover indicators (`group-hover:translate-x-1`), border glows, and smooth transitions (`transition-all duration-300`).

## 📱 Mobile-First Responsive UX
- **Desktop**: Fixed sidebar navigation (`Sidebar.tsx`).
- **Mobile**: Off-screen slide-over glass drawer (`-translate-x-full` → `translate-x-0` with backdrop overlay `bg-black/80 backdrop-blur-sm`) + fixed bottom glass action bar (`MobileNav.tsx`).
- Never let navigation drawers obscure main tool content on mobile devices.
