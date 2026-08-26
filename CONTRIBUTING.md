# Contributing to DataMaster Pro

Thank you for your interest in contributing to **DataMaster Pro**! This guide outlines how to set up your local development environment, project architecture conventions, and how to add new data engineering tools.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: 18.0+ (LTS recommended)
- **Package Manager**: 
pm

### 2. Installation & Running
`ash
# Clone the repository
git clone https://github.com/Naveen071110/datamaster-pro.git
cd datamaster-pro

# Install dependencies
npm install

# Start Vite dev server
npm run dev
`
Open http://localhost:5173 in your browser.

---

## 📁 Repository Structure

`
src/
├── features/        # Feature-specific modules (e.g. sql-sandbox WASM init)
├── layouts/         # Layout components (AppShell, Header, Sidebar, MobileNav, Footer)
├── lib/             # Enterprise libraries (cookies, consent manager)
├── pages/           # Page components for each tool
├── router/          # Route definitions (routes.tsx)
├── shared/          # Reusable UI primitives, hooks, SEO helpers, types, and constants
└── stores/          # Zustand state store with persistence
`

---

## ➕ Adding a New Tool

1. **Create the Page Component**:
   - Add src/pages/YourToolPage.tsx.
   - Use Tailwind CSS and Radix UI components from src/shared/components/ui/.
   - Ensure responsive layout (mobile, tablet, desktop).
   - Add the <SEO /> component at the top of the JSX for automatic metadata & schemas.

2. **Register the Route**:
   - In src/router/routes.tsx, lazy-load YourToolPage and add it to outes.

3. **Add Navigation Entry**:
   - In src/shared/utils/constants.ts and src/layouts/Sidebar.tsx, add your tool to NAV_ITEMS with the appropriate category (utilities, etl_cloud, or dvanced).

4. **Add SEO & Sitemap Metadata**:
   - In src/shared/utils/seoData.ts, define your route's Title, Meta Description, Keywords, H1, Category, and FAQ items.
   - In public/sitemap.xml, add the <url> block with lastmod, changefreq, and priority.

5. **Run Verification**:
   `ash
   # Run TypeScript typecheck
   npm run lint

   # Run production build
   npm run build
   `

---

## 🔒 Security & Privacy Guidelines
- All data processing **must be 100% client-side**. Do not send user data, SQL queries, or schemas to external APIs.
- Use setCookie() from @/lib/cookies if storing persistent user preferences.

---

## 📄 License
By contributing to DataMaster Pro, you agree that your contributions will be licensed under the [MIT License](LICENSE).
