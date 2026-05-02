# 🐾 Petshop Platform — Jakarta

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444.svg)](https://turbo.build/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-e0234e.svg)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e.svg)](https://supabase.com/)

> **A professional-grade E-Commerce, Booking, and Delivery Platform** specifically designed for pet shops in Jakarta. Built with a modern monorepo architecture for maximum scalability and code reusability across Web, Mobile, and Desktop.

---

## 🚀 Overview

Petshop Platform is an integrated solution that automates core business operations:
- **E-Commerce**: Real-time inventory, variants, and seamless checkout.
- **Service Booking**: Automated slots for Grooming and Pet Hotel with DP payments.
- **Logistics**: Automated shipping costs (RajaOngkir) and same-day delivery rules.
- **Loyalty**: Points-based reward system to increase customer retention.

---

## 🏗️ Architecture (Monorepo)

This project utilizes a **Turborepo** monorepo structure to share 90% of business logic across all platforms.

### Apps
- 🌐 **Web**: Customer-facing store built with **Next.js (App Router)**.
- 🛠️ **Admin**: Internal management dashboard for orders and inventory.
- 📱 **Mobile**: **React Native (Expo)** app sharing the same core hooks and state.
- ⚙️ **API**: High-performance **NestJS** standalone server.

### Shared Packages
- `@petshop/core`: Centralized business logic (pricing, shipping rules).
- `@petshop/api-client`: Shared SDK for all frontend platforms.
- `@petshop/types`: Single source of truth for TypeScript definitions.
- `@petshop/hooks`: Reusable React hooks for Auth, Cart, and Booking.

> Detailed architectural diagrams can be found in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## ✨ Key Features

- **Auth**: Secure Phone OTP (WhatsApp) and Google OAuth via Supabase.
- **Payments**: Integrated with Midtrans/Xendit (QRIS, VA, E-Wallet).
- **Pet Profile**: Management for multiple pets to personalize booking and recommendations.
- **Smart Shipping**: Automatic filtering for frozen products (same-day only) and distance-based calculations.
- **Owner Dashboard**: Real-time financial metrics (Net Profit, AOV, LTV).

---

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, shadcn/ui, Framer Motion.
- **Backend**: NestJS, TypeScript, PostgreSQL.
- **Infrastructure**: Supabase (Auth, DB, Storage, Edge Functions).
- **Tooling**: pnpm, Turborepo, TanStack Query, Zustand.

---

## 📂 Project Structure

```bash
petshop/
├── apps/
│   ├── web/        # Next.js App
│   ├── admin/      # Admin Dashboard
│   ├── mobile/     # Expo App
│   └── api/        # NestJS API
├── packages/
│   ├── core/       # Business Logic
│   ├── types/      # Shared Types
│   ├── api-client/ # API SDK
│   └── ui/         # Shared Web UI
└── supabase/       # SQL Migrations & Seed
```

---

## 📝 Product Roadmap

See the full [Product Requirements Document (PRD)](./prd.md) for detailed modules, user flows, and database schema.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**Developed with ❤️ as a Portfolio Project.**
