# Pawvels Project Instructions

This file contains foundational mandates for the Pawvels project. These instructions take absolute precedence over general workflows.

## 🧠 Behavioral Protocol (LOCKED)

### 1. Insight-First Communication

- **NEVER** modify code silently just to fix linter or build errors.
- If a `push` or `commit` fails, provide a technical **ANALYSIS** first: explain what failed, which file is affected, and your proposed fix.
- **WAIT** for user confirmation before executing any "emergency refactoring" or "simplification".

### 2. Preserving UI Mandates

- Certain UI decisions are **LOCKED** and must not be reverted during code restoration or bug fixing:
  - **FOOTER**: Strictly disabled/removed in `ShopLayout` for mobile-first infinite scroll feel.
  - **BOTTOM NAV**: Strictly 4 tabs (Home, Produk, Booking, Akun).
  - **BRANDING**: Search Bar border and specific icons must remain Salmon-Orange (`#E07B39`).
  - **3D STACK**: Must remain solid (100% opacity) unless explicitly requested otherwise.
- Always cross-reference `artifacts/session-progress-report.md` before performing a large file restoration.

### 3. Surgical Integrity & Type Safety

- **NO SILENT SIMPLIFICATION**: Do not delete imports or variables just to pass linting without informing the user.
- If a variable is blocking the build, report it as an insight. Ask if the variable should be implemented properly or removed.
- Use explicit type casting (e.g., `as CSSProperties`) only when necessary and ensure the type is imported.

### 4. Mandatory Pre-Validation

- Before stating a task is "DONE" or "KELAR", you **MUST** run the project's validation commands (e.g., `pnpm type-check` or `npm run lint`) to confirm no new errors were introduced.

## 🏗️ Technical Architecture

- Monorepo: Turborepo + pnpm.
- Frontend: Next.js 15 (App Router).
- Styling: Tailwind CSS v4 + Framer Motion.
- State: Zustand with local persistence for Cart.
