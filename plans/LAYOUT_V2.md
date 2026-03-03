# ShopBot Store — Professional Layout Plan v2

## Root Cause of CSS Failure

The previous implementation had two issues:
1. **`Playfair_Display` font** imported without `weight` parameter (required for non-variable Google Fonts)
2. **`tailwind.config.ts` fontFamily with CSS variables** — `var(--font-sans)` in the config causes PostCSS issues in some Next.js 14 setups
3. **Dev server must be restarted** after any `tailwind.config.ts` change (hot-reload does not pick it up)

**Immediate fix:** Use `inter.className` directly (no CSS variable approach), remove display font from Tailwind config.

---

## Design System — "Clean Editorial"

### Philosophy
Minimal, refined, editorial. Inspired by premium DTC brands (Away, Everlane, Allbirds).
Not flashy — clean and confident. Whitespace as a design element.

### Color Palette
| Token | Value | Use |
|-------|-------|-----|
| Background | `#F9F8F5` (warm white) | Page background |
| Card | `#FFFFFF` | Cards, panels |
| Foreground | `#111827` | Primary text |
| Primary | `#4F46E5` (indigo) | Brand color, CTAs |
| Muted | `#F3F2EF` | Secondary bg |
| Muted-fg | `#6B7280` | Secondary text |
| Border | `#E5E4DF` | Dividers, card borders |

### Typography
- **Font**: Inter only (system-safe, guaranteed to load)
- **Scale**: xs(12) / sm(14) / base(16) / lg(18) / xl(20) / 2xl(24) / 3xl(30) / 4xl(36) / 5xl(48)
- **Weights**: 400 (body), 500 (ui), 600 (semibold), 700 (bold), 800 (hero)

### Spacing
- Container max-width: `1280px`
- Page padding: `px-4 md:px-6 lg:px-8`
- Section gaps: `py-12 md:py-16 lg:py-20`
- Card padding: `p-4`
- Border radius: `rounded-lg` (8px default), `rounded-xl` (12px for cards)

### Interaction States
- Hover lift: `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`
- Button hover: `hover:opacity-90`
- Link hover: `hover:text-primary`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary/50`

---

## Page-by-Page Plan

### 1. Navbar ✅
- Logo: "ShopBot" wordmark + icon
- Desktop: Logo | [Orders] [Admin?] | [Search] [Cart] [Auth]
- Mobile: Logo | [Cart] [Menu]
- Style: `bg-white/95 backdrop-blur border-b`

### 2. Hero (Home) ✅
- Layout: text left, visual right (reversed on mobile: text top, visual bottom)
- Headline: Large, bold, 2 lines max
- Subtext: Short, one paragraph
- CTAs: Primary filled + secondary outlined
- Visual: 2×2 grid of colored category cards with emoji

### 3. Product Grid ✅
- Header: "All Products" + count + filters
- Grid: `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`
- Card: image + category badge + name + price + cart button

### 4. Product Card ✅
- Clean white card with thin border
- Full image (aspect-square, object-cover)
- Info section: category dot, name (2 lines), price
- Cart button: appears on hover (slide up)

### 5. Product Detail Page ✅
- Breadcrumb
- 2-column: image | details
- Price in primary color
- Qty selector + Add to Cart + Ask AI
- Trust badges row

### 6. Cart Drawer ✅
- Slide from right
- Item list with image + name + qty + price
- Shipping progress bar
- Total + Checkout button

### 7. Cart Page ✅
- Items list (2/3 width) + Order Summary (1/3)
- Shipping progress in summary

### 8. Orders Page ✅
- Order cards with header (id, date, status) + items + total

### 9. Auth Pages ✅
- Split screen: brand left, form right
- Simple, clean form design

### 10. Footer ✅
- 4-column: Brand | Shop | Account | Support
- Bottom bar: copyright

---

## Implementation Order

1. `tailwind.config.ts` + `globals.css` + `layout.tsx` — design tokens
2. `Navbar.tsx` + `Footer.tsx` — layout shell
3. `Hero.tsx` — home page hero
4. `ProductCard.tsx` + `ProductFilters.tsx` — grid
5. `CartDrawer.tsx` — cart overlay
6. `app/page.tsx` — home layout
7. `app/products/[id]/page.tsx` — product detail
8. `app/cart/page.tsx` + `app/orders/page.tsx` — pages
9. `app/auth/**` — auth pages

## Critical Note
**After changing tailwind.config.ts, always restart the dev server:**
```
Ctrl+C → npm run dev
```
