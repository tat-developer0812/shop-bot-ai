/**
 * Admin endpoint to manage product embeddings.
 * POST /api/embeddings — regenerate all product embeddings
 * POST /api/embeddings?productId=xxx — regenerate single product embedding
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerateAllEmbeddings, upsertProductEmbedding, isEmbeddingsEnabled } from "@/lib/embeddings";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isEmbeddingsEnabled()) {
    return NextResponse.json(
      { error: "Embeddings not configured. Set OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (productId) {
    await upsertProductEmbedding(productId);
    return NextResponse.json({ success: true, productId });
  }

  const result = await regenerateAllEmbeddings();
  return NextResponse.json(result);
}
