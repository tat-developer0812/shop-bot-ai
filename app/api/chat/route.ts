import { streamText, generateText } from "ai";
import { chatModel, buildSystemPrompt, allTools } from "@/lib/ai";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const SUMMARY_THRESHOLD = 10; // messages before we start summarizing
const RECENT_MESSAGES_KEEP = 5; // keep this many recent messages after summary

export async function POST(req: Request) {
  const { messages, sessionId, cartItems, imageBase64, imageMimeType } = await req.json();

  // Get current user for personalization
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load user preferences
  let userPreferences = null;
  if (user) {
    userPreferences = await db.userPreferences.findUnique({ where: { userId: user.id } });
  }

  // ── Session + Summarization ──────────────────────────────────────────────
  let conversationSummary: string | null = null;
  let messagesToSend = messages;

  if (sessionId) {
    const lastMessage = messages[messages.length - 1];

    // Upsert session
    const session = await db.chatSession.upsert({
      where: { sessionId },
      create: { sessionId, userId: user?.id },
      update: {},
    });
    conversationSummary = session.summary;

    // Persist user message
    if (lastMessage?.role === "user") {
      await db.chatMessage.create({
        data: { sessionId, role: "user", content: lastMessage.content },
      });
    }

    // Progressive summarization: if we have many messages, summarize old ones
    const dbMessageCount = await db.chatMessage.count({ where: { sessionId } });
    if (dbMessageCount > SUMMARY_THRESHOLD && messages.length > SUMMARY_THRESHOLD) {
      const oldMessages = messages.slice(0, messages.length - RECENT_MESSAGES_KEEP);
      const recentMessages = messages.slice(-RECENT_MESSAGES_KEEP);

      if (oldMessages.length > 0) {
        try {
          const { text: newSummary } = await generateText({
            model: chatModel,
            messages: [
              {
                role: "user",
                content: `Summarize this shopping conversation in 3-5 bullet points. Focus on: what the customer is looking for, their budget, preferences, and any products they showed interest in.\n\n${oldMessages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}`,
              },
            ],
          });

          // Update summary in DB
          await db.chatSession.update({
            where: { sessionId },
            data: { summary: newSummary },
          });
          conversationSummary = newSummary;
        } catch {
          // Summarization failed — continue with full history
        }
      }

      messagesToSend = recentMessages;
    }
  }

  // Build messages array, optionally with image
  const finalMessages = messagesToSend.map((m: { role: string; content: string }, i: number) => {
    // Attach image to the last user message if provided
    if (i === messagesToSend.length - 1 && m.role === "user" && imageBase64) {
      return {
        role: "user" as const,
        content: [
          {
            type: "image" as const,
            image: `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}`,
          },
          { type: "text" as const, text: m.content || "What product is in this image? Find similar products in the store." },
        ],
      };
    }
    return m;
  });

  const systemPrompt = buildSystemPrompt({
    cartItems,
    userName: user?.email?.split("@")[0],
    userPreferences,
    conversationSummary,
  });

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages: finalMessages,
    tools: allTools,
    maxSteps: 5, // allow multi-step tool use (search → add_to_cart, etc.)
    onFinish: async ({ text, usage, steps }) => {
      if (!sessionId) return;

      // Collect token counts from all steps
      let totalInputTokens = usage?.promptTokens ?? 0;
      let totalOutputTokens = usage?.completionTokens ?? 0;

      // Persist assistant message with token usage
      if (text) {
        await db.chatMessage.create({
          data: {
            sessionId,
            role: "assistant",
            content: text,
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
          },
        });
      }

      // If there were tool call steps with no final text, still log tool use
      if (!text && steps && steps.length > 0) {
        const toolNames = steps
          .flatMap((s) => s.toolCalls ?? [])
          .map((tc) => tc.toolName)
          .join(", ");
        if (toolNames) {
          await db.chatMessage.create({
            data: {
              sessionId,
              role: "assistant",
              content: `[Used tools: ${toolNames}]`,
              inputTokens: totalInputTokens,
              outputTokens: totalOutputTokens,
            },
          });
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
