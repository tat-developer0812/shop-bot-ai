import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { messageId, rating, sessionId } = await req.json();

  if (!messageId || (rating !== 1 && rating !== -1)) {
    return NextResponse.json({ error: "messageId and rating (1 or -1) are required" }, { status: 400 });
  }

  // Find the message by its AI SDK message ID or DB ID
  // The AI SDK uses client-generated IDs; we need to find the matching DB record by sessionId + content approximation.
  // We store feedback linked to the closest assistant message in the session.
  let dbMessageId = messageId;

  // Try direct lookup first
  const directMessage = await db.chatMessage.findUnique({ where: { id: messageId } });

  if (!directMessage && sessionId) {
    // Fall back: find the most recent assistant message in the session
    const fallbackMessage = await db.chatMessage.findFirst({
      where: { sessionId, role: "assistant" },
      orderBy: { createdAt: "desc" },
    });
    if (fallbackMessage) {
      dbMessageId = fallbackMessage.id;
    } else {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
  } else if (!directMessage) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Upsert feedback (one rating per message)
  const feedback = await db.messageFeedback.upsert({
    where: { messageId: dbMessageId },
    create: { messageId: dbMessageId, rating },
    update: { rating },
  });

  return NextResponse.json({ success: true, feedback });
}
