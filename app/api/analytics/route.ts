import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { generateText } from "ai";
import { chatModel } from "@/lib/ai";

function isAdmin(userId: string | undefined | null) {
  return userId && userId === process.env.ADMIN_USER_ID;
}

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // ── Messages per day ──────────────────────────────────────────────────────
  const messagesRaw = await db.chatMessage.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  const byDay: Record<string, { user: number; assistant: number }> = {};
  for (const m of messagesRaw) {
    const day = m.createdAt.toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { user: 0, assistant: 0 };
    byDay[day][m.role === "user" ? "user" : "assistant"]++;
  }
  const messagesPerDay = Object.entries(byDay).map(([date, counts]) => ({ date, ...counts }));

  // ── Session stats ─────────────────────────────────────────────────────────
  const totalSessions = await db.chatSession.count({ where: { createdAt: { gte: since } } });
  const totalMessages = messagesRaw.length;
  const userMessages = messagesRaw.filter((m) => m.role === "user").length;

  // ── Token usage & cost estimate ───────────────────────────────────────────
  const tokenStats = await db.chatMessage.aggregate({
    where: { createdAt: { gte: since }, role: "assistant" },
    _sum: { inputTokens: true, outputTokens: true },
  });
  const inputTokens = tokenStats._sum.inputTokens ?? 0;
  const outputTokens = tokenStats._sum.outputTokens ?? 0;
  // claude-sonnet-4-6 pricing (as of 2025): $3/M input, $15/M output
  const estimatedCostUSD =
    (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;

  // ── Top user messages (sample for analysis) ───────────────────────────────
  const recentUserMessages = await db.chatMessage.findMany({
    where: { role: "user", createdAt: { gte: since } },
    select: { content: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Simple keyword frequency
  const wordFreq: Record<string, number> = {};
  const stopWords = new Set([
    "the", "a", "an", "i", "is", "it", "in", "on", "at", "to", "for",
    "of", "and", "or", "do", "you", "me", "my", "we", "can", "what",
    "how", "that", "this", "have", "has", "be", "are", "was", "will",
    "get", "want", "need", "please", "hi", "hello", "thanks",
  ]);
  for (const m of recentUserMessages) {
    const words = m.content.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w));
    for (const w of words) {
      wordFreq[w] = (wordFreq[w] ?? 0) + 1;
    }
  }
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // ── Feedback stats ────────────────────────────────────────────────────────
  const feedbackStats = await db.messageFeedback.groupBy({
    by: ["rating"],
    _count: { rating: true },
    where: { createdAt: { gte: since } },
  });
  const thumbsUp = feedbackStats.find((f) => f.rating === 1)?._count.rating ?? 0;
  const thumbsDown = feedbackStats.find((f) => f.rating === -1)?._count.rating ?? 0;

  // ── Poor responses ────────────────────────────────────────────────────────
  const poorResponses = await db.messageFeedback.findMany({
    where: { rating: -1, createdAt: { gte: since } },
    include: { message: { select: { content: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    period: { days, since: since.toISOString() },
    summary: {
      totalSessions,
      totalMessages,
      userMessages,
      avgMessagesPerSession: totalSessions > 0 ? Math.round((userMessages / totalSessions) * 10) / 10 : 0,
    },
    tokens: {
      inputTokens,
      outputTokens,
      estimatedCostUSD: Math.round(estimatedCostUSD * 100) / 100,
    },
    messagesPerDay,
    topKeywords,
    feedback: { thumbsUp, thumbsDown, total: thumbsUp + thumbsDown },
    poorResponses: poorResponses.map((r) => ({
      messageContent: r.message.content.slice(0, 200),
      createdAt: r.message.createdAt,
    })),
  });
}

// POST /api/analytics?action=nlquery — natural language query about analytics
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { question } = await req.json();
  if (!question) return NextResponse.json({ error: "question is required" }, { status: 400 });

  // Gather a snapshot of analytics data to give Claude context
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [totalMessages, totalSessions, recentMessages, topProducts] = await Promise.all([
    db.chatMessage.count({ where: { createdAt: { gte: since7 } } }),
    db.chatSession.count({ where: { createdAt: { gte: since7 } } }),
    db.chatMessage.findMany({
      where: { role: "user", createdAt: { gte: since7 } },
      select: { content: true },
      take: 50,
    }),
    db.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  const context = `
Analytics snapshot (last 7 days):
- Total chat messages: ${totalMessages}
- Total sessions: ${totalSessions}
- Top-selling products: ${topProducts.map((p) => `${productMap[p.productId] ?? p.productId} (qty: ${p._sum.quantity})`).join(", ")}
- Sample user questions: ${recentMessages
    .slice(0, 20)
    .map((m) => m.content.slice(0, 100))
    .join(" | ")}
`;

  const { text } = await generateText({
    model: chatModel,
    messages: [
      {
        role: "user",
        content: `You are an AI analytics assistant for an e-commerce store. Answer this question based on the data:\n\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return NextResponse.json({ answer: text });
}
