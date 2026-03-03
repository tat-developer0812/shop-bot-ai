/**
 * RAG Pipeline — Semantic Product Search with pgvector
 *
 * Uses OpenAI text-embedding-3-small (1536 dims) via @ai-sdk/openai.
 * Requires OPENAI_API_KEY in .env.local
 * Requires pgvector extension enabled in Supabase (run: SELECT * FROM setup_pgvector())
 *
 * Setup SQL (run once in Supabase SQL editor):
 *   CREATE EXTENSION IF NOT EXISTS vector;
 *   ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(1536);
 *   CREATE INDEX IF NOT EXISTS products_embedding_idx
 *     ON products USING ivfflat (embedding vector_cosine_ops)
 *     WITH (lists = 100);
 */

import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/lib/db";

const EMBEDDING_MODEL = openai.embedding("text-embedding-3-small");
const DIMENSIONS = 1536;

export function isEmbeddingsEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Generate an embedding vector for a text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: text,
  });
  return embedding;
}

/**
 * Build the text representation of a product for embedding.
 */
export function productToEmbeddingText(product: {
  name: string;
  description: string;
  category: string;
  features?: string | null;
  tags?: string | null;
}): string {
  return [
    product.name,
    product.category,
    product.description,
    product.features,
    product.tags,
  ]
    .filter(Boolean)
    .join(" | ");
}

/**
 * Generate and store embedding for a product.
 * Uses raw SQL since Prisma doesn't support vector type natively.
 */
export async function upsertProductEmbedding(productId: string): Promise<void> {
  if (!isEmbeddingsEnabled()) return;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const text = productToEmbeddingText(product);
  const embedding = await generateEmbedding(text);

  // Store as pgvector using raw SQL
  await db.$executeRaw`
    UPDATE products
    SET embedding = ${`[${embedding.join(",")}]`}::vector(${DIMENSIONS})
    WHERE id = ${productId}
  `;
}

/**
 * Find the top-K most semantically similar products to a query.
 * Returns products sorted by cosine similarity.
 */
export async function semanticProductSearch(
  query: string,
  topK: number = 5
): Promise<Array<{ id: string; name: string; price: number; category: string; description: string; stock: number; similarity: number }>> {
  if (!isEmbeddingsEnabled()) return [];

  const queryEmbedding = await generateEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  // cosine similarity search using pgvector
  const results = await db.$queryRaw<
    Array<{ id: string; name: string; price: number; category: string; description: string; stock: number; similarity: number }>
  >`
    SELECT
      id, name, price, category, description, stock,
      1 - (embedding <=> ${vectorStr}::vector(${DIMENSIONS})) AS similarity
    FROM products
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorStr}::vector(${DIMENSIONS})
    LIMIT ${topK}
  `;

  return results;
}

/**
 * Regenerate embeddings for ALL products.
 * Use this after first setup or when product data changes significantly.
 */
export async function regenerateAllEmbeddings(): Promise<{ updated: number; failed: number }> {
  if (!isEmbeddingsEnabled()) {
    return { updated: 0, failed: 0 };
  }

  const products = await db.product.findMany();
  let updated = 0;
  let failed = 0;

  for (const product of products) {
    try {
      await upsertProductEmbedding(product.id);
      updated++;
    } catch (err) {
      console.error(`Failed to embed product ${product.id}:`, err);
      failed++;
    }
  }

  return { updated, failed };
}
