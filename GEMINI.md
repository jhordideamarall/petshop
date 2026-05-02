# Pawvels Project Instructions

This file contains foundational mandates for the Pawvels project. These instructions take absolute precedence over general workflows.

## 🧠 Behavioral Protocol (LOCKED)

### 1. Insight-First Communication

- **NEVER** modify code silently just to fix linter or build errors.
- If a `push` or `commit` fails, provide a technical **ANALYSIS** first: explain what failed, which file is affected, and your proposed fix.
- **WAIT** for user confirmation before executing any "emergency refactoring" or "simplification".

### 2. Mandatory Context Gathering

- **ALWAYS** read `prd.md` and `ARCHITECTURE.md` at the start of a session to understand the project's goal.
- **ALWAYS** check the `artifacts/` folder (especially `phase-progress.md` and recent session reports) to understand historical context, audit reports, and past architectural decisions.
- Do not blindly assume the project state without reading these files first.

### 3. Preserving UI Mandates

- Certain UI decisions are **LOCKED** and must not be reverted during code restoration or bug fixing:
  - **FOOTER**: Strictly disabled/removed in `ShopLayout` for mobile-first infinite scroll feel.
  - **BOTTOM NAV**: Strictly 4 tabs (Home, Produk, Booking, Akun).
  - **BRANDING**: Search Bar border, Category Tags, Cards (like Grooming/Same Day), and List Separators must consistently use Salmon-Orange (`rgba(224, 123, 57, 0.3)` or `#E07B39` with opacity) for their borders to maintain theme unity.
  - **3D STACK / BANNER CAROUSEL**:
    - The custom piece-wise stacking algorithm must be preserved.
    - **NEVER** use `transformStyle: 'preserve-3d'` on the carousel items (causes Z-fighting/clipping).
    - `zIndex` must be dynamically generated based on distance (e.g., `100 - dist * 10`).
    - The invisible native scroll proxy (`overflowX: scroll`) MUST have `zIndex: 200` to ensure it sits on top of all cards, allowing touch-drag and click passthrough.
    - Must remain solid (`opacity: 1`) for the active card, dynamically fading the background cards.
- Always cross-reference `artifacts/session-progress-report.md` before performing a large file restoration.

### 4. Surgical Integrity & Type Safety

- **NO SILENT SIMPLIFICATION**: Do not delete imports or variables just to pass linting without informing the user.
- If a variable is blocking the build, report it as an insight. Ask if the variable should be implemented properly or removed.
- Use explicit type casting (e.g., `as CSSProperties`) only when necessary and ensure the type is imported.

### 5. Mandatory Pre-Validation

- Before stating a task is "DONE" or "KELAR", you **MUST** run the project's validation commands (e.g., `pnpm type-check` or `npm run lint`) to confirm no new errors were introduced.

### 6. Design Source of Truth vs. Wireframes

- **`user-flow.html` is ONLY for logic & flow**: It defines _what_ pages must exist, _what_ elements must be present, and _how_ users navigate. It is essentially a wireframe.
- **DO NOT** use `user-flow.html` as a visual or CSS reference.
- **The True Design System** lives in the existing code (e.g., `app/(shop)/page.tsx`, `header.tsx`). When building the remaining pages based on `user-flow.html`, you **MUST** recycle the existing aesthetic:
  - Keep the Salmon-Orange (`#E07B39`) branding.
  - Keep the rounded radiuses, specific drop shadows, and Framer Motion spring configs.
  - **NEVER** overwrite existing polished components just to match the raw/placeholder styling seen in `user-flow.html`.

### 7. Git Hook & Stash Recovery Protocol

- The project uses strict `husky` and `lint-staged` pre-commit hooks.
- **IF A COMMIT FAILS** (e.g. `pnpm type-check` or `eslint` exits with code 1) AND the working files suddenly "revert" to an older state, **DO NOT PANIC and DO NOT REWRITE THE CODE**.
- This happens because `lint-staged` stashed your unstaged changes before crashing.
- **RECOVERY PROCEDURE**:
  1. Run `git stash list` to confirm the backup exists.
  2. Run `git checkout stash@{0} -- <affected-files>` (or `git stash apply`) to immediately restore your brilliant code.
  3. Manually fix the specific linter/TypeScript errors that caused the hook to fail.
  4. Run `pnpm type-check` and `npx eslint <file>` manually to verify.
  5. Attempt the `git push` again.

## 🏗️ Technical Architecture

- Monorepo: Turborepo + pnpm.
- Frontend: Next.js 15 (App Router).
- Styling: Tailwind CSS v4 + Framer Motion.
- State: Zustand with local persistence for Cart.
