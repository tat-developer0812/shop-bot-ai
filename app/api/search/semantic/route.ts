import { NextResponse } from "next/server";
import { semanticProductSearch, isEmbeddingsEnabled } from "@/lib/embeddings";

export async function POST(req: Request) {
  if (!isEmbeddingsEnabled()) {
    return NextResponse.json(
      { error: "Semantic search not configured. Set OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  const { query, topK = 5 } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const results = await semanticProductSearch(query, topK);
  return NextResponse.json({ results });
}
