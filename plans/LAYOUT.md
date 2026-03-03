# ShopBot Store — Layout Beautification Plan

## Goal
Transform the current functional-but-plain UI into a polished, modern e-commerce store that feels premium. Inspired by Vercel, Linear, and modern DTC brands (no generic "dashboard" look).

---

## Design System

### Color Palette
Move from the default shadcn neutral palette to a stronger brand identity:

```css
/* Primary — deep indigo/violet */
--primary: 246 83% 55%;           /* #5B48F5 */
--primary-foreground: 0 0% 100%;

/* Accent — warm amber for CTAs */
--accent: 38 100% 50%;            /* #FF9800 */
--accent-foreground: 0 0% 10%;

/* Neutral base */
--background: 0 0% 98%;           /* near-white */
--foreground: 222 47% 11%;        /* near-black */

/* Card / surface */
--card: 0 0% 100%;
--card-foreground: 222 47% 11%;

/* Muted */
--muted: 220 14% 96%;
--muted-foreground: 220 9% 46%;

/* Border */
--border: 220 13% 91%;
--radius: 0.75rem;
```

### Typography
```css
/* Import in app/layout.tsx */
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

/* Usage */
--font-sans: "Inter", sans-serif;      /* body, UI */
--font-display: "Playfair Display", serif;  /* hero headlines */
```

### Spacing & Shadow Tokens
```css
/* Add to globals.css */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
--shadow-lg: 0 10px 30px -3px rgb(0 0 0 / 0.1);
--shadow-product: 0 8px 24px -4px rgb(91 72 245 / 0.15);
```

---

## Page-by-Page Breakdown

---

### 1. Navbar (`components/Navbar.tsx`)

**Current:** Basic flex bar with logo + links + icons.

**Target:** Sticky glass navbar with blur backdrop.

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo + wordmark]    [Shop] [About]    [🔍] [Cart(3)] [Sign In] │
└─────────────────────────────────────────────────────────────┘
  backdrop-blur  border-b  bg-white/80  sticky top-0 z-50
```

**Changes:**
- `sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border/60`
- Logo: add a simple SVG icon (shopping bag) before wordmark
- Cart icon: show item count badge as a floating dot (red dot, not a number badge)
- Auth: if signed in, show avatar circle with initials; if not, "Sign in" ghost button
- Active page indicator: thin bottom border under current route link
- Mobile: hamburger menu sliding from left via shadcn Sheet

**Files:** `components/Navbar.tsx`

---

### 2. Hero Section (new — `components/Hero.tsx`)

**Current:** No hero, product grid starts immediately.

**Target:** Full-width editorial hero above the product grid on the home page.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    Discover Products                                        │
│    Powered by AI                         [Featured Image]   │
│                                                             │
│    Ask our AI assistant anything about               │
│    our products — it knows everything.                      │
│                                                             │
│    [Shop Now →]  [Chat with AI]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  gradient background: from-violet-50 via-white to-amber-50
  min-h-[60vh]  grid grid-cols-2 gap-12  px-8 py-16
```

**Details:**
- Left col: headline in `font-display text-5xl`, sub-copy in `text-muted-foreground`
- Two CTA buttons: primary (filled violet) + secondary (outline)
- Right col: grid of 4 small product images in a 2×2 mosaic with slight rotation offsets
- Subtle animated gradient blob in background (CSS `@keyframes`)
- Stat row below: `1,200+ Products | AI-Powered | Free Shipping over $50`

**Files:** `components/Hero.tsx`, `app/page.tsx`

---

### 3. Product Grid + Filters (`app/page.tsx`, `components/ProductFilters.tsx`)

**Current:** Plain grid with text filter buttons.

**Target:** Clean editorial grid with pill filters and section header.

```
┌──────────────────────────────────────────────────────┐
│  All Products                    [All] [Electronics] [Fashion] … │
│  ─────────────────────────────────────────────────── │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ img    │  │ img    │  │ img    │  │ img    │    │
│  │        │  │        │  │        │  │        │    │
│  │ Name   │  │ Name   │  │ Name   │  │ Name   │    │
│  │ $xx.xx │  │ $xx.xx │  │ $xx.xx │  │ $xx.xx │    │
│  │[Cart+] │  │[Cart+] │  │[Cart+] │  │[Cart+] │    │
│  └────────┘  └────────┘  └────────┘  └────────┘    │
└──────────────────────────────────────────────────────┘
```

**Changes:**
- Section header: `"All Products"` in `text-2xl font-semibold` + product count pill
- Filter bar: horizontal scroll on mobile, pill buttons with `rounded-full px-4 py-1.5`
- Active filter: filled background `bg-primary text-primary-foreground`
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5`
- Loading state: `components/ProductSkeleton.tsx` (shimmer animation)

**Files:** `app/page.tsx`, `components/ProductFilters.tsx`, `components/ProductSkeleton.tsx` (new)

---

### 4. Product Card (`components/ProductCard.tsx`)

**Current:** Basic card with image, name, price, and button.

**Target:** Hover-lift card with image zoom and quick-action overlay.

```
┌──────────────────────────┐
│  ╔══════════════════╗    │
│  ║  product image   ║    │  ← aspect-square overflow-hidden
│  ║   (zoom on       ║    │    group-hover:scale-105 transition
│  ║    hover)        ║    │
│  ╚══════════════════╝    │
│  Electronics  · In stock  │  ← category badge + stock dot
│  Product Name             │  ← font-medium text-sm line-clamp-2
│  $29.99                   │  ← font-bold text-primary
│  [+ Add to Cart]          │  ← full-width button, appears on hover
└──────────────────────────┘
  group  rounded-xl  border  shadow-sm  hover:shadow-product
  hover:-translate-y-1  transition-all duration-200
```

**Details:**
- Card wraps in `<Link href="/products/[id]">` for full click area
- Top-right: wishlist heart icon (ghost, decorative for now)
- Category badge: small pill with colored dot per category
- "Add to Cart" button: slides up from bottom on hover via `translate-y` + `opacity`
- Out of stock: gray overlay + "Out of Stock" badge on image
- `aspect-square` image container with `object-cover`

**Files:** `components/ProductCard.tsx`

---

### 5. Product Detail Page (`app/products/[id]/page.tsx`)

**Current:** Side-by-side image + info, basic layout.

**Target:** Full editorial product page.

```
┌─── Breadcrumb: Home / Electronics / Product Name ───────────┐
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │                     │  │  Electronics                 │  │
│  │    Product Image    │  │  # Product Name              │  │
│  │    (large, square)  │  │  ★★★★☆  (decorative)        │  │
│  │                     │  │                              │  │
│  │                     │  │  $49.99                      │  │
│  └─────────────────────┘  │                              │  │
│                           │  Description paragraph...    │  │
│  ← thumbnail strip →      │                              │  │
│                           │  [− 1 +]  [Add to Cart]      │  │
│                           │                              │  │
│                           │  [🤖 Ask AI about this]      │  │
│                           │                              │  │
│                           │  ✓ Free shipping over $50    │  │
│                           │  ✓ 30-day returns            │  │
│                           └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Changes:**
- Breadcrumb navigation component
- Quantity selector: `[−] [1] [+]` inline with Add to Cart
- Trust badges row: shipping, returns, secure payment icons
- Description in a toggle `<details>` if long
- "Ask AI" button prominent with robot icon (already wired, needs styling)
- Related products strip at bottom (query same category)

**Files:** `app/products/[id]/page.tsx`, `components/Breadcrumb.tsx` (new)

---

### 6. Cart Drawer (`components/CartDrawer.tsx`)

**Current:** Basic slide-out drawer with items list.

**Target:** Polished mini-cart with visual hierarchy.

```
┌────────────────────────────────┐
│  Cart  (3 items)        [✕]   │
│  ───────────────────────────  │
│  ┌─────┐ Product Name         │
│  │ img │ Electronics          │
│  └─────┘ $29.99  [− 1 +] [🗑] │
│  ───────────────────────────  │
│  [repeat for each item]        │
│  ───────────────────────────  │
│  Subtotal           $89.97    │
│  Shipping           Free      │
│  ───────────────────────────  │
│  Total              $89.97    │
│                               │
│  [Checkout Now  →]            │
│  [Continue Shopping]          │
└────────────────────────────────┘
```

**Changes:**
- Item row: `image (48px) | name+category | price | qty controls | remove`
- Free shipping progress bar: "Add $X more for free shipping"
- Subtotal/total section with clear visual separation
- Checkout button: full-width, filled primary
- Empty state: illustrated empty bag SVG + "Your cart is empty" + "Shop Now" link

**Files:** `components/CartDrawer.tsx`

---

### 7. Cart Page (`app/cart/page.tsx`)

**Current:** Table-style cart page.

**Target:** Two-column cart + order summary layout.

```
┌──────────────────────────────────────────────────────┐
│  Your Cart (3 items)                                 │
│                                                      │
│  ┌──────────────────────────┐  ┌──────────────────┐  │
│  │ Item rows (full details) │  │  Order Summary   │  │
│  │ with image, name, qty,   │  │  Subtotal $89.97 │  │
│  │ price, remove            │  │  Shipping  Free  │  │
│  │                          │  │  ────────────    │  │
│  │                          │  │  Total   $89.97  │  │
│  │                          │  │                  │  │
│  │                          │  │  [Checkout →]    │  │
│  └──────────────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Files:** `app/cart/page.tsx`

---

### 8. Orders Page (`app/orders/page.tsx`)

**Current:** Basic list of orders.

**Target:** Clean order history with status timeline.

```
┌─────────────────────────────────────────────────────┐
│  Order History                                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Order #abc123          Feb 25 2026  PENDING  │  │
│  │  ─────────────────────────────────────────   │  │
│  │  [img] Product 1 × 2          $59.98          │  │
│  │  [img] Product 2 × 1          $29.99          │  │
│  │  ─────────────────────────────────────────   │  │
│  │  Total                        $89.97          │  │
│  └──────────────────────────────────────────────┘  │
│  [repeat per order]                                 │
└─────────────────────────────────────────────────────┘
```

**Changes:**
- Order card with collapsible item list
- Status badge: `PENDING` (yellow), `PAID` (green), `SHIPPED` (blue), `DELIVERED` (gray)
- Order ID truncated with monospace font
- Empty state: "No orders yet" + "Start Shopping" link

**Files:** `app/orders/page.tsx`

---

### 9. Auth Pages (`app/auth/sign-in`, `app/auth/sign-up`)

**Current:** Centered card with basic form.

**Target:** Split-screen auth layout.

```
┌──────────────────────────────────────────────────────┐
│                        │                             │
│   Brand panel          │   Form panel                │
│   (gradient bg)        │                             │
│                        │   Sign in to ShopBot        │
│   ShopBot              │                             │
│   "Your AI shopping    │   Email                     │
│    assistant"          │   [________________]        │
│                        │   Password                  │
│   • AI-powered search  │   [________________]        │
│   • Smart suggestions  │                             │
│   • Order tracking     │   [Sign In]                 │
│                        │                             │
│                        │   Don't have an account?    │
│                        │   Sign up                   │
└──────────────────────────────────────────────────────┘
```

**Files:** `app/auth/sign-in/SignInForm.tsx`, `app/auth/sign-up/SignUpForm.tsx`

---

### 10. Chat Widget (`components/ChatWidget.tsx`)

**Current:** Fixed bottom-right bubble + slide-up panel.

**Target:** More polished chat UI.

```
  Closed:
  ┌──────────────────────────────────┐
  │  [🤖]  Chat with AI     [✕/−]   │  ← floating pill button
  └──────────────────────────────────┘

  Open:
  ╔═══════════════════════════════╗
  ║  🤖 ShopBot Assistant    [−] ║  ← header bar
  ╠═══════════════════════════════╣
  ║  Hello! How can I help?       ║
  ║                               ║
  ║              Hi, tell me      ║
  ║              about laptops ▸  ║  ← user bubble right-aligned
  ║                               ║
  ║  Sure! Here are our best…     ║
  ╠═══════════════════════════════╣
  ║  [Type a message...    ] [→]  ║  ← input bar
  ╚═══════════════════════════════╝
```

**Changes:**
- Floating pill trigger button (not just an icon)
- Chat header with bot avatar + name + online indicator
- User messages: right-aligned, primary-colored bubble
- Bot messages: left-aligned, white bubble with subtle border
- Typing indicator: three animated dots when loading
- Input: rounded pill with send icon button
- Smooth spring animation on open/close

**Files:** `components/ChatWidget.tsx`

---

### 11. Footer (new — `components/Footer.tsx`)

**Current:** No footer.

**Target:** Minimal 3-column footer.

```
┌─────────────────────────────────────────────────────┐
│  ShopBot Store                                      │
│  AI-powered shopping experience                     │
│                                                     │
│  Shop          Account         Support              │
│  All Products  Sign In         FAQ                  │
│  Categories    Orders          Contact              │
│  New Arrivals  Settings        Returns              │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  © 2026 ShopBot Store · Built with Next.js + Claude │
└─────────────────────────────────────────────────────┘
```

**Files:** `components/Footer.tsx`, `app/layout.tsx`

---

### 12. Loading Skeletons (`components/ProductSkeleton.tsx`)

**Target:** Shimmer skeleton for the product grid while loading.

```tsx
// Shimmer animation via Tailwind:
// animate-pulse  bg-muted  rounded-xl

// Card skeleton shape mirrors ProductCard
<div className="rounded-xl border overflow-hidden animate-pulse">
  <div className="aspect-square bg-muted" />
  <div className="p-3 space-y-2">
    <div className="h-3 w-16 bg-muted rounded" />
    <div className="h-4 w-full bg-muted rounded" />
    <div className="h-4 w-20 bg-muted rounded" />
  </div>
</div>
```

**Files:** `components/ProductSkeleton.tsx`

---

## Implementation Order

### Step 1 — Design tokens (30 min)
- Update `app/globals.css` — new color palette, font variables, shadow tokens
- Update `tailwind.config.ts` — add `accent`, `display` font, extend shadows
- Install Google Fonts in `app/layout.tsx`

### Step 2 — Navbar polish (30 min)
- Glassmorphism sticky nav
- Mobile hamburger with Sheet
- Auth state display

### Step 3 — Product Card (45 min)
- Hover effects, image zoom, overlay button
- Category badge, stock indicator

### Step 4 — Hero Section (45 min)
- New `Hero.tsx` component
- Inject into `app/page.tsx`

### Step 5 — Product grid + skeletons (30 min)
- `ProductSkeleton.tsx`
- Grid section header + filter pills

### Step 6 — Product Detail page (45 min)
- Breadcrumb, quantity selector, trust badges, related products

### Step 7 — Cart Drawer + Cart Page (30 min)
- Cart drawer overhaul
- Cart page two-column layout

### Step 8 — Chat Widget (30 min)
- Message bubble styling, typing indicator, pill trigger

### Step 9 — Auth pages (20 min)
- Split-screen layout

### Step 10 — Orders page (20 min)
- Status badges, collapsible items

### Step 11 — Footer (15 min)
- New `Footer.tsx`, add to layout

---

## Key Tailwind Classes Reference

```
Glassmorphism: backdrop-blur-md bg-white/80 border border-white/20
Product card hover: hover:-translate-y-1 hover:shadow-product transition-all duration-200
Image zoom: group-hover:scale-105 transition-transform duration-300
Gradient bg: bg-gradient-to-br from-violet-50 via-white to-amber-50
Status badge: rounded-full px-2 py-0.5 text-xs font-medium
Chat bubble (user): ml-auto bg-primary text-primary-foreground rounded-2xl rounded-br-sm
Chat bubble (bot): mr-auto bg-white border rounded-2xl rounded-bl-sm
Skeleton: animate-pulse bg-muted rounded
```
