# Pawvels — Progress & Phase Plan

> Dokumen ini merangkum pekerjaan yang sudah selesai dan rencana lanjutan seluruh fase pembangunan platform.
> Update terakhir: 2026-05-03

---

## Status Ringkas

| Fase Implementasi | Nama                            | Status           |
| ----------------- | ------------------------------- | ---------------- |
| Phase 0           | Infra & Tooling                 | ✅ Selesai       |
| Phase 1           | Database Foundation             | ✅ Selesai       |
| Phase 2           | Design System & App Shell       | ✅ Selesai       |
| Phase 3           | Authentication                  | 🔲 Belum dimulai |
| Phase 4           | Core E-Commerce (Browse & Cart) | 🔲 Belum dimulai |
| Phase 5           | Checkout & Payment              | 🔲 Belum dimulai |
| Phase 6           | Order Management & Admin        | 🔲 Belum dimulai |
| Phase 7           | Booking System                  | 🔲 Belum dimulai |
| Phase 8           | Pet Profile & Loyalty           | 🔲 Belum dimulai |
| Phase 9           | Backend API (NestJS)            | 🔲 Belum dimulai |

> **📝 NOTE: STRATEGI EKSEKUSI "FRONT-END FIRST"**
> Sesuai kesepakatan terbaru, kita akan **MENGABAIKAN urutan fase konvensional** yang langsung mengikat UI dengan Backend.
> Seluruh pengembangan dari Phase 3 hingga Phase 8 wajib memprioritaskan pembuatan **UI, Flow, dan Local Logic (Zustand/Dummy Data)** terlebih dahulu mengacu pada `user-flow.html`.
> Jangan sentuh integrasi Supabase/Backend sebelum seluruh komponen visual dan navigasi halaman tersebut sempurna 100%.

---

## Phase 0 — Infra & Tooling ✅

**Tujuan**: Setup fondasi monorepo agar semua tim bisa bergerak paralel.

### Yang sudah dikerjakan:

- Monorepo Turborepo + pnpm workspaces
- `apps/web` → Next.js 15 App Router + TypeScript strict + Tailwind v4
- `packages/ui` → shadcn/ui primitives (Button, Card, Sheet, Badge, Input)
- `packages/tsconfig` → tsconfig shared untuk semua packages
- Brand tokens: font Inter (sans) + Outfit (heading), primary orange oklch
- CI/CD: Husky pre-commit hooks + commitlint + GitHub Actions
- Path alias `@/*` terkonfigurasi

---

## Phase 1 — Database Foundation ✅

**Tujuan**: Semua tabel, RLS, enum, dan trigger sudah production-ready sebelum ada satu baris UI.

### Yang sudah dikerjakan:

- **26 tabel PostgreSQL** di Supabase, mencakup:
  - E-Commerce: `users`, `addresses`, `pets`, `categories`, `products`, `product_variants`, `product_images`, `carts`, `cart_items`, `orders`, `order_items`, `order_tracking`
  - Booking: `service_types`, `service_slots`, `bookings`, `booking_pets`
  - Content & UX: `banners`, `reviews`, `wishlists`, `vouchers`, `voucher_usages`
  - Loyalty: `loyalty_points`, `loyalty_redemptions`
  - Notifikasi: `notifications`
  - Audit: `audit_logs`
- Schema master: `master_initial_schema_v3.sql` — single source of truth
- Role-based RLS: Owner / Admin / Staff / Customer (granular per tabel)
- Trigger otomatis: auth-sync user, rating-sync (safe CASE/WHEN), fuzzy full-text search
- Indexes: covering index untuk query produk, order lookup, booking slot

### File referensi:

- `artifacts/phase-1-database-report.md`
- `artifacts/audit-phase0dan1-new.md`
- `artifacts/role-permission-matrix.md`

---

## Phase 2 — Design System & App Shell ✅

**Tujuan**: Semua halaman punya shell yang konsisten (header, nav, typography) sebelum isi data real.

### Yang sudah dikerjakan:

**Design tokens** (`apps/web/app/globals.css`):

- Warm cream background `#FDFCFB` / `#F5F3F0`
- CSS custom props: `--color-orange: #E07B39`, `--color-ink: #1A1714`, `--color-stone: #F5F3F0`, dst.
- Typography classes: `.t-display`, `.t-heading`, `.t-title`, `.t-label`, `.t-body`, `.t-small`, `.t-micro`, `.t-price`
- Keyframe `cartBadgePop` untuk animasi bounce cart badge
- Chip classes, slot pill, radio card, tab bar, `.safe-bottom`

**Layout components** (`apps/web/components/layout/`):

- `header.tsx` — location row (Jakarta Selatan + bell/cart icons) + search pill → `/search`
- `bottom-nav.tsx` — 4 tab: Home / Produk / Booking / Akun, active state orange, safe-area aware

**Shared components** (`apps/web/components/shared/`):

- `product-card.tsx` — image, discount badge, PriceTag, RatingStars, add-to-cart bounce
- `product-grid.tsx` — responsive 2/3/4 col grid
- `price-tag.tsx` — harga promo orange + strikethrough original
- `skeleton.tsx` — variants: card, text, avatar, grid

**Providers** (`apps/web/components/providers/`):

- `providers.tsx` — Sonner Toaster (toast notifications)

**App routes** (`apps/web/app/`):

- Route group `(shop)/` → `layout.tsx` (position:fixed shell: Header + scrollable main + BottomNav) + `page.tsx` (home)
- Route group `(auth)/` → stubs: login, register, forgot-password
- Route group `(account)/` → stubs: account, orders, pets, addresses, loyalty, wishlist
- `booking/` → stubs: booking, grooming, hotel
- `cart/page.tsx`, `checkout/page.tsx`
- `sitemap.ts`, `robots.ts` (SEO base)

**Home page** (`app/(shop)/page.tsx`):

- Hero banner dark gradient + flash sale chip + CTA
- Feature strip 3-col (pengiriman, original, loyalty)
- Kategori horizontal scroll chips
- Grooming & Pet Hotel banner
- Penawaran Terbaik grid (4 product cards placeholder)

**Konfigurasi**:

- `next.config.ts`: `typedRoutes: true`, Supabase image domains
- TypeScript: `tsc --noEmit` → **0 error**

---

## Phase 3 — Authentication (Next)

**Estimasi**: 1–2 minggu  
**Tujuan**: User bisa register dan login sebelum boleh checkout atau booking.

### Yang perlu dikerjakan:

1. **Supabase Auth setup**
   - Enable Phone OTP provider di Supabase dashboard
   - Enable Google OAuth provider
   - Configure redirect URLs

2. **Auth pages** (mengisi stub yang sudah ada):
   - `app/(auth)/login/page.tsx` — form phone/email + OTP flow
   - `app/(auth)/register/page.tsx` — form nama + phone → OTP → profil
   - `app/(auth)/forgot-password/page.tsx`

3. **Auth state management**
   - `components/providers/auth-provider.tsx` — Supabase session listener
   - Tambah ke `providers.tsx`
   - Custom hook `useAuth()` → session, user, signOut

4. **Protected routes**
   - Middleware `apps/web/middleware.ts` — redirect ke `/login` jika unauthenticated (untuk `/account/*`, `/checkout`, `/booking/*`)

5. **Header update**
   - Ganti icon user di header dengan conditional: avatar jika logged in, icon jika guest

6. **Database**:
   - Trigger `auth_sync` sudah ada di Phase 1 (auto-create `users` record saat signup Supabase)

---

## Phase 4 — Core E-Commerce: Browse & Cart

**Estimasi**: 2–3 minggu  
**Tujuan**: User bisa browse produk, lihat detail, dan tambah ke cart.

### Yang perlu dikerjakan:

1. **Supabase data fetching** (RSC — langsung dari server component)
   - `lib/supabase/server.ts` — createServerClient helper
   - `lib/supabase/client.ts` — createBrowserClient helper

2. **Products listing** (`app/(shop)/products/page.tsx`):
   - Fetch dari tabel `products` + `categories` + `product_variants`
   - Filter by category, search query param
   - Infinite scroll atau pagination
   - Real `ProductGrid` + `ProductCard` dengan data nyata

3. **Product detail** (`app/(shop)/products/[slug]/page.tsx`):
   - Image gallery
   - Variant selector (size/weight)
   - Quantity stepper
   - Add to cart button dengan bounce animation
   - Rating section
   - generateMetadata untuk SEO

4. **Categories** (`app/(shop)/categories/[slug]/page.tsx`):
   - Filter produk by category

5. **Search** (`app/(shop)/search/page.tsx`):
   - Full-text search ke Supabase (sudah ada index di Phase 1)
   - Debounced input

6. **Cart** (`app/cart/page.tsx`):
   - Cart state via Zustand (client-side) + sync ke tabel `carts`/`cart_items` saat logged in
   - Item list, quantity stepper, remove
   - Subtotal, shipping estimate placeholder
   - CTA ke checkout

7. **State management**:
   - `stores/cart-store.ts` — Zustand cart store
   - `stores/auth-store.ts` — user session

---

## Phase 5 — Checkout & Payment

**Estimasi**: 2 minggu  
**Tujuan**: User bisa checkout dan bayar.

### Yang perlu dikerjakan:

1. **Checkout page** (`app/checkout/page.tsx`):
   - Address selection / new address form
   - Shipping method (RajaOngkir API)
   - Payment method (Midtrans/Xendit)
   - Order summary
   - Apply voucher

2. **Payment integration**:
   - Midtrans Snap.js untuk credit card / virtual account / QRIS
   - Webhook handler di API route untuk update `orders.payment_status`

3. **Shipping**:
   - RajaOngkir API wrapper
   - Ongkir calculation per kurir (JNE/J&T/SiCepat)

4. **Order creation**:
   - `POST /api/orders` → insert ke `orders` + `order_items`, clear cart, trigger notif

5. **Checkout success** (`app/checkout/success/page.tsx`):
   - Order confirmation, nomor order, estimasi kirim

---

## Phase 6 — Order Management & Admin Dashboard

**Estimasi**: 2 minggu  
**Tujuan**: Admin bisa lihat dan update semua order.

### Yang perlu dikerjakan:

1. **Account pages** (mengisi stubs):
   - `app/(account)/orders/page.tsx` — order history customer
   - Order detail dengan tracking timeline

2. **Admin routes** (baru):
   - `app/(admin)/dashboard/page.tsx` — metrics: revenue, orders, bookings
   - `app/(admin)/orders/page.tsx` — tabel semua order + update status
   - `app/(admin)/products/page.tsx` — CRUD produk
   - `app/(admin)/banners/page.tsx` — CMS banner

3. **Role guard**:
   - Middleware check `user.role` → redirect jika bukan admin/owner

---

## Phase 7 — Booking System

**Estimasi**: 2 minggu  
**Tujuan**: Customer bisa booking grooming/hotel, admin bisa manage slot.

### Yang perlu dikerjakan:

1. **Booking pages** (mengisi stubs):
   - `app/booking/page.tsx` — pilih layanan (grooming/hotel)
   - `app/booking/grooming/page.tsx` — date picker, slot selection, pet selection
   - `app/booking/hotel/page.tsx` — check-in/out, pet selection

2. **Slot availability**:
   - Query `service_slots` dengan lock pada concurrent booking (PostgreSQL row-level lock sudah disiapkan)

3. **Booking confirmation & notif**:
   - WhatsApp notification via Twilio / Fonnte

---

## Phase 8 — Pet Profile, Loyalty & Polish

**Estimasi**: 2 minggu  
**Tujuan**: Fitur retention — user punya alasan kembali.

### Yang perlu dikerjakan:

1. **Pet profile** (`app/(account)/pets/`):
   - CRUD hewan piaraan (nama, jenis, foto, catatan medis)

2. **Loyalty points**:
   - Tampilkan poin di account page
   - Redeem poin saat checkout

3. **Wishlist** (`app/(account)/wishlist/`):
   - Save produk, quick-add to cart

4. **Review & rating**:
   - Post-purchase review form di order detail

---

## Phase 9 — Backend API (NestJS)

**Estimasi**: 3–4 minggu (paralel dengan Phase 5–8)  
**Tujuan**: Pisahkan write operations ke dedicated API untuk keamanan dan skalabilitas.

### Yang perlu dikerjakan:

- Setup `apps/api` dengan NestJS + Prisma
- Auth module (validate Supabase JWT)
- Orders module (create, update status)
- Products module (admin CRUD)
- Bookings module
- Webhooks (Midtrans, RajaOngkir)

> Note: Untuk Phase 3–6, write operations bisa sementara via Next.js API Routes dulu, lalu migrasi ke NestJS di Phase 9.

---

## Urutan Eksekusi yang Disarankan

```
Phase 2 ✅ → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
                                              ↕
                                        Phase 9 (paralel)
```

Phase 3 (auth) harus selesai sebelum Phase 4 (cart/checkout membutuhkan user ID).  
Phase 9 (backend) bisa dikerjakan paralel mulai dari Phase 5.

---

## File Kunci per Phase

| Phase          | File Utama                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Auth (3)       | `app/(auth)/`, `middleware.ts`, `components/providers/auth-provider.tsx` |
| E-Commerce (4) | `app/(shop)/products/`, `stores/cart-store.ts`, `lib/supabase/`          |
| Checkout (5)   | `app/checkout/`, `app/api/orders/`, `app/api/shipping/`                  |
| Admin (6)      | `app/(admin)/`, `middleware.ts` role guard                               |
| Booking (7)    | `app/booking/`, `app/api/bookings/`                                      |
| Loyalty (8)    | `app/(account)/`, `stores/loyalty-store.ts`                              |
| Backend (9)    | `apps/api/` NestJS monorepo app                                          |
