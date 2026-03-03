# ShopBot Store

An AI-powered e-commerce store with a built-in shopping assistant chatbot. Browse products, get AI recommendations, manage your cart, and place orders — all in one app.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS + accessible components |
| Auth | Supabase Auth | User authentication & sessions |
| Database | PostgreSQL (Supabase) | Relational data storage |
| ORM | Prisma | Database access & migrations |
| AI | Anthropic Claude (via Vercel AI SDK) | Streaming chat responses |
| State | Zustand | Client-side state (cart, drawer) |
| Icons | Lucide React | UI iconography |
| Validation | Zod | Runtime schema validation |

## Features

- **Product catalog** — grid view with category filters and search
- **AI chat assistant** — powered by Claude, aware of your cart and all products in the store
- **Ask about a product** — click a button to open chat pre-filled with a product question
- **Shopping cart** — persistent cart with slide-in drawer UI
- **Order placement** — authenticated checkout saves orders to the database
- **Order history** — view past orders with status tracking
- **Admin panel** — full CRUD: add, edit, and delete products (admin-only)
- **Responsive design** — works on desktop and mobile

## Project Structure

```
├── app/
│   ├── layout.tsx                    # Root layout (Navbar, ChatWidget, CartDrawer, Footer)
│   ├── page.tsx                      # Home — product grid with filters & search
│   ├── globals.css                   # Global Tailwind styles
│   ├── products/[id]/page.tsx        # Product detail page
│   ├── cart/page.tsx                 # Shopping cart page
│   ├── orders/page.tsx               # Order history (auth required)
│   ├── chat/
│   │   ├── layout.tsx                # Chat layout (hides footer)
│   │   └── page.tsx                  # Full-page AI chat interface
│   ├── admin/                        # Admin panel (protected)
│   │   ├── page.tsx                  # Product management table
│   │   ├── AdminProductActions.tsx   # Delete/edit action buttons
│   │   ├── ProductForm.tsx           # Shared create/edit form
│   │   └── products/
│   │       ├── new/page.tsx          # Create product
│   │       └── [id]/edit/page.tsx    # Edit product
│   ├── auth/
│   │   ├── sign-in/                  # Sign in page + form
│   │   └── sign-up/                  # Sign up page + form
│   └── api/
│       ├── chat/route.ts             # POST — stream AI chat responses
│       ├── products/route.ts         # GET (list/filter) + POST (create)
│       ├── products/[id]/route.ts    # GET + PUT + DELETE (admin)
│       ├── orders/route.ts           # GET (user orders) + POST (create order)
│       ├── checkout/route.ts         # Stripe checkout (Phase 4 — stub)
│       └── webhooks/stripe/route.ts  # Stripe webhook (Phase 4 — stub)
├── components/
│   ├── Navbar.tsx                    # Navigation bar (responsive, auth, admin link)
│   ├── Hero.tsx                      # Homepage hero section
│   ├── Footer.tsx                    # Site footer
│   ├── ChatWidget.tsx                # Floating AI chat bubble + panel
│   ├── ProductCard.tsx               # Product display card
│   ├── ProductFilters.tsx            # Category filter buttons
│   ├── SearchBar.tsx                 # Search input
│   ├── ProductSkeleton.tsx           # Loading skeleton
│   ├── CartDrawer.tsx                # Slide-in cart drawer
│   ├── AddToCartButton.tsx           # Add to cart button
│   ├── AskAboutProductButton.tsx     # Opens chat with product question
│   ├── CheckoutButton.tsx            # Place order button
│   ├── chat/                         # Chat-specific components
│   │   ├── ChatHeader.tsx            # Chat header with status indicator
│   │   ├── ChatInput.tsx             # Message input with send button
│   │   ├── ChatMessages.tsx          # Message list with suggestions
│   │   └── MessageBubble.tsx         # Individual message bubble
│   └── ui/                           # shadcn/ui primitives
│       ├── button.tsx
│       ├── badge.tsx
│       └── toaster.tsx
├── lib/
│   ├── db.ts                         # Prisma client singleton
│   ├── ai.ts                         # Anthropic client + dynamic system prompt
│   ├── utils.ts                      # cn(), formatPrice()
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       └── server.ts                 # Server Supabase client
├── store/
│   ├── useCart.ts                    # Zustand cart store (localStorage persistence)
│   └── useCartDrawer.ts             # Zustand drawer open/close state
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # 8 seed products
├── scripts/
│   └── test-db.ts                    # Database connectivity test
├── middleware.ts                      # Supabase session refresh middleware
├── tailwind.config.ts                # Tailwind theme (colors, animations, fonts)
├── postcss.config.mjs                # PostCSS (Tailwind + autoprefixer)
├── next.config.js                    # Next.js config (image remote patterns)
└── tsconfig.json                     # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (provides PostgreSQL + Auth)
- An [Anthropic](https://console.anthropic.com) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Database — Supabase connection strings
# Transaction Pooler (port 6543) for app queries
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-X-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Session Pooler (port 5432) for migrations
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-X-REGION.pooler.supabase.com:5432/postgres"

# Admin — your Supabase user ID (get from Supabase Dashboard → Auth → Users)
ADMIN_USER_ID=your-user-uuid
NEXT_PUBLIC_ADMIN_USER_ID=your-user-uuid

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Connection tip:** If port 5432 is blocked by your ISP, use the **Session Pooler** URL (port 5432 on `pooler.supabase.com`) for `DIRECT_URL` and the **Transaction Pooler** (port 6543) for `DATABASE_URL`. Both are found in Supabase Dashboard → Settings → Database → Connection string.

### 3. Push database schema

```bash
npm run db:push
```

### 4. Seed products

```bash
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Set up Admin access

1. Sign up / sign in to the app
2. Find your user ID in Supabase Dashboard → Authentication → Users
3. Set `ADMIN_USER_ID` and `NEXT_PUBLIC_ADMIN_USER_ID` in `.env.local`
4. Restart the dev server — the **Admin** link appears in the navbar

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed 8 sample products |
| `npm run db:test` | Test database connectivity |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
| `npm run db:generate` | Regenerate Prisma client |

## Database Schema

```
Product       id, name, description, price, image, category, stock, createdAt, updatedAt
Order         id, userId, status (PENDING/PAID/SHIPPED/DELIVERED/CANCELLED), total, stripeId, createdAt
OrderItem     id, orderId, productId, quantity, price (snapshot at order time)
ChatSession   id, userId, sessionId, createdAt
ChatMessage   id, sessionId, role (user/assistant), content, createdAt
```

**Relationships:**
- Order → OrderItem (one-to-many, cascade delete)
- Product → OrderItem (one-to-many)
- ChatSession → ChatMessage (one-to-many, cascade delete)

## API Routes

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat` | POST | — | Stream AI chat responses (sends messages + cart context) |
| `/api/products` | GET | — | List products with optional `?category=` and `?search=` filters |
| `/api/products` | POST | Required | Create a new product |
| `/api/products/[id]` | GET | — | Get a single product |
| `/api/products/[id]` | PUT | Admin | Update a product |
| `/api/products/[id]` | DELETE | Admin | Delete a product |
| `/api/orders` | GET | Required | Get authenticated user's orders |
| `/api/orders` | POST | Required | Create an order from cart items |

## Roadmap

- [x] Phase 0 — Project scaffold
- [x] Phase 1 — Bootstrap & run locally
- [x] Phase 2 — Chat event listener + order API + checkout
- [x] Phase 3 — Admin panel (full product CRUD)
- [ ] Phase 4 — Stripe payments
- [ ] Phase 5 — Polish & Vercel deploy
#   s h o p - b o t - a i  
 