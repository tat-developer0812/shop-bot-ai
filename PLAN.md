# ShopBot Store — Build Plan

## Overview

Full-stack AI e-commerce store built with Next.js 14, Clerk auth, Supabase PostgreSQL, Prisma ORM, and Anthropic Claude. Built phase-by-phase from scaffold to production.

---

## Phase 0 — Scaffold ✅

All starter files written. No commands run yet.

**Files created:**
- `package.json` — dependencies (no Stripe yet)
- `prisma/schema.prisma` — full DB schema
- `prisma/seed.ts` — 8 seed products
- `lib/db.ts`, `lib/ai.ts`, `lib/utils.ts`
- `store/useCart.ts`, `store/useCartDrawer.ts`
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- `app/products/[id]/page.tsx`, `app/cart/page.tsx`, `app/orders/page.tsx`
- `app/api/chat/route.ts`, `app/api/products/route.ts`
- `app/api/checkout/route.ts` (stub), `app/api/webhooks/stripe/route.ts` (stub)
- All `components/` files
- `.env.local` with keys

---

## Phase 1 — Bootstrap & Run ✅

**Goal:** Get the app running locally with real data.

**Commands:**
```bash
npm install
npm run db:push    # creates tables in Supabase
npm run db:seed    # seeds 8 products
npm run dev        # starts at http://localhost:3000
```

**Lessons learned:**
- `next.config.ts` not supported in Next.js 14 — renamed to `next.config.js`
- `ts-node` not installed — switched to `tsx` for seed script
- `npx prisma db push` doesn't load `.env.local` — added `dotenv-cli` wrapper scripts
- Supabase direct connection (port 5432) blocked by ISP — use Session Pooler (port 5432 on pooler host) for `DIRECT_URL` and Transaction Pooler (port 6543) for `DATABASE_URL`
- Transaction Pooler (port 6543) blocks DDL — must use Session Pooler (port 5432) as `DIRECT_URL` for `prisma db push`
- Supabase pooler region matters — must use the correct region from dashboard (e.g. `aws-1-ap-northeast-1` not `aws-0-us-east-1`)

---

## Phase 2 — Fix Critical Bugs ✅

**Goal:** Fix 2 broken features.

### Bug 1: Chat event listener missing
- **File:** `components/ChatWidget.tsx`
- **Fix:** Added `useEffect` listening for `window` custom event `"open-chat"`
  - Calls `setIsOpen(true)` and `setInput(event.detail.message)`
  - Wired to `AskAboutProductButton` which dispatches the event

### Bug 2: No order creation
- **File:** `app/api/orders/route.ts` (new)
  - `POST` — receives cart items, creates `Order` + `OrderItems` in DB
  - `GET` — returns authenticated user's order history
- **File:** `components/CheckoutButton.tsx` (rewritten)
  - Calls `POST /api/orders` with cart items
  - Clears cart on success, redirects to `/orders`

---

## Phase 3 — Admin Panel ✅

**Goal:** Manage products without touching the database directly.

**Files created:**
- `app/api/products/[id]/route.ts` — `GET`, `PUT`, `DELETE` (admin-only)
- `app/admin/page.tsx` — product table, server-side admin guard
- `app/admin/AdminProductActions.tsx` — client delete + edit link
- `app/admin/ProductForm.tsx` — shared create/edit form
- `app/admin/products/new/page.tsx` — create product page
- `app/admin/products/[id]/edit/page.tsx` — edit product page

**Files modified:**
- `components/Navbar.tsx` — added Admin link for admin users
- `.env.local` — added `ADMIN_USER_ID` + `NEXT_PUBLIC_ADMIN_USER_ID`

**Security:** All `/admin` routes check `userId === process.env.ADMIN_USER_ID` server-side.

---

## Phase 4 — Stripe Payments ⏳

**Goal:** Real payment flow via Stripe Checkout.

**Steps:**
1. Add Stripe keys to `.env.local`
2. Restore `lib/stripe.ts` — Stripe client + `createCheckoutSession()`
3. Restore `app/api/checkout/route.ts` — create Stripe Checkout session
4. Restore `app/api/webhooks/stripe/route.ts` — handle `checkout.session.completed` → create Order in DB
5. Update `components/CheckoutButton.tsx` — redirect to Stripe URL
6. Test with card `4242 4242 4242 4242`

**Files to change:**
- `lib/stripe.ts`
- `app/api/checkout/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `components/CheckoutButton.tsx`
- `.env.local` — add `STRIPE_*` keys

---

## Phase 5 — Polish & Deploy ⏳

**Goal:** Production-ready on Vercel.

**Steps:**
1. `components/ProductSkeleton.tsx` — loading skeleton for product grid
2. `middleware.ts` — Clerk route protection
3. Mobile responsiveness audit
4. `vercel deploy` or connect GitHub → Vercel
5. Set all env vars in Vercel dashboard
6. Run `prisma db push` against production DB
7. Verify production URL end-to-end

**Files to create:**
- `components/ProductSkeleton.tsx`
- `middleware.ts`

---

## Environment Variables Reference

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | clerk.com → app → API Keys (`pk_test_...`) |
| `CLERK_SECRET_KEY` | clerk.com → app → API Keys (`sk_test_...`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (JWT format) |
| `DATABASE_URL` | Supabase → Settings → Database → Transaction Pooler |
| `DIRECT_URL` | Supabase → Settings → Database → Session Pooler |
| `ADMIN_USER_ID` | Clerk Dashboard → Users → your user ID |
| `NEXT_PUBLIC_ADMIN_USER_ID` | same as above |

---

## Supabase Connection Guide

Supabase offers 3 connection types. Use **both** pooler types together with Prisma:

| Type | Host | Port | Username | Use for |
|------|------|------|----------|---------|
| Transaction Pooler | `aws-X-REGION.pooler.supabase.com` | 6543 | `postgres.PROJECT_REF` | `DATABASE_URL` (app queries) |
| Session Pooler | `aws-X-REGION.pooler.supabase.com` | 5432 | `postgres.PROJECT_REF` | `DIRECT_URL` (migrations) |
| Direct | `db.PROJECT_REF.supabase.co` | 5432 | `postgres` | Not usable if ISP blocks port 5432 |

> Get connection strings from: Supabase Dashboard → Settings → Database → Connection string → change **Method** dropdown.
