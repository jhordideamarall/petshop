# CLAUDE.md

## Purpose

Work efficiently, safely, and without breaking existing behavior.

---

## Core Principles

- Understand before acting
- Prefer small, incremental changes
- Reuse existing logic, avoid rewriting
- Keep solutions simple and readable
- audit codebase first
- jangan buat design ui ai slop, selalu buat design profesional
- jangan selalu lakukan audit codebase karena itu burn token sangat banyak, cukup lakukan sekali dan simpan ke memory pastikan selalu ingat biar efisien

---

## Safety

- Do not change existing behavior unless explicitly asked
- Be careful with important logic (pricing, transactions, etc.)
- If unsure, explain first before making changes

---

## Workflow

- Read `prd.md` and `ARCHITECTURE.md` always update and call memory pekerjaan sebelumnya agar tidak menghabiskan banyak token tiap sessi dimulai
- Always read the `artifacts/` folder at the start of a task to understand historical context, audit reports, and past architectural decisions.
- For large tasks → propose a plan first
- For small tasks → act directly but keep changes minimal
- Avoid modifying many files at once
- jangan buat file worktree, fokus pada main repo atau branc utama saja

---

## Production Awareness

- Assume this code can affect production
- Avoid risky structural changes without explanation

---

## Communication

- Be concise and clear
- Focus on actionable output
- Avoid unnecessary long explanations

---

## Default Mode

- Practical
- Incremental
- Production-aware
- dont sepak not important message
- selalu update dan buat persisten memory untuk sebuah plan dan pekerjaan yang disetujui diproject ini agar setiap sesi project ini kamu tau harus ngapain aja

---

## UI & Design Standards

- **Source of Truth vs. Wireframes**: `user-flow.html` is ONLY for logic & flow (what pages exist, how they connect). **DO NOT** use it as a visual or CSS reference.
- **The True Design System** lives in the existing codebase (`app/(shop)/page.tsx`, `header.tsx`, etc.). When building pages based on `user-flow.html`, you **MUST** recycle the existing aesthetic.
- **NEVER** overwrite existing polished components just to match the raw/placeholder styling seen in `user-flow.html`.
- **BRANDING**: Search Bar border, Category Tags, Cards (like Grooming/Same Day), and List Separators must consistently use Salmon-Orange (`rgba(224, 123, 57, 0.3)` or `#E07B39` with opacity) for their borders to maintain theme unity.
- **3D STACK / CAROUSEL**:
  - The custom piece-wise stacking algorithm must be preserved.
  - **NEVER** use `transformStyle: 'preserve-3d'` on the carousel items (causes Z-fighting).
  - The invisible native scroll proxy (`overflowX: scroll`) MUST have `zIndex: 200` to allow touch-drag and click passthrough.

---
