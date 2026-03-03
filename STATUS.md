# ShopBot AI — Project Status

Last updated: Phase 4 complete (AI Agent + RAG + Analytics + Payments)

## Tech Stack
- **Framework**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: Anthropic Claude (chat + vision) via Vercel AI SDK
- **Agent**: Claude Tool Use — search_products, add_to_cart, check_order_status, get_product_details
- **RAG**: pgvector + OpenAI embeddings (optional, requires OPENAI_API_KEY)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Supabase Auth
- **Payments**: Stripe Checkout (optional, requires STRIPE keys)
- **State**: Zustand (cart)

## Features Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Product catalog (CRUD) | ✅ | Admin panel at `/admin` |
| AI Chat with streaming | ✅ | `/api/chat` — Claude claude-sonnet-4-6 |
| AI Tool Use (Agent) | ✅ | search, add-to-cart, order status |
| Conversation Memory | ✅ | Summarizes after 10+ messages |
| RAG Semantic Search | ✅ | pgvector + OpenAI embeddings |
| Image Search (Vision) | ✅ | Upload image → find similar products |
| Analytics Dashboard | ✅ | `/admin/analytics` — cost, keywords, feedback |
| Personalization Engine | ✅ | UserPreferences updated after orders |
| Feedback Loop (👍/👎) | ✅ | Per-message rating → admin visibility |
| Stripe Payments | ✅ | Redirect to Stripe Checkout |
| Supabase Auth | ✅ | Sign in / sign up |
| Cart (Zustand) | ✅ | Persisted in localStorage |
| Orders | ✅ | Order history at `/orders` |

## Environment Variables

Required:
```
ANTHROPIC_API_KEY=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_USER_ID=
NEXT_PUBLIC_ADMIN_USER_ID=
```

Optional (enables extra features):
```
OPENAI_API_KEY=          # enables RAG/semantic search
STRIPE_SECRET_KEY=       # enables Stripe checkout
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Setup

```bash
npm install
npm run db:push     # push schema to Supabase
npm run db:seed     # seed products
npm run dev         # start at http://localhost:3000
```

## pgvector Setup (for RAG)
Run once in Supabase SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS products_embedding_idx
  ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```
Then call `POST /api/embeddings` as admin to index all products.

## Stripe Test
Card: `4242 4242 4242 4242` · Any future date · Any CVC
