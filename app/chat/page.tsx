"use client";

import { useState, useCallback } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import type { Message } from "@/components/chat/MessageBubble";

/**
 * Mock AI responses — in production, replace with useChat() from "ai/react"
 * or any streaming API. This demonstrates the full UI lifecycle.
 */
const mockResponses: Record<string, string> = {
  default:
    "I'd be happy to help! I can assist you with finding products, comparing options, checking order status, or answering questions about our store. What would you like to know?",
  "What are your best-selling products?":
    "Great question! Here are our current best sellers:\n\n1. **Sony WH-1000XM5** — Premium noise-cancelling headphones ($348)\n2. **Apple MacBook Air M3** — Ultra-thin laptop with all-day battery ($1,099)\n3. **Nike Air Max 270** — Comfortable everyday sneakers ($150)\n4. **Dyson V15 Detect** — Smart cordless vacuum ($749)\n\nWould you like more details on any of these?",
  "Help me find electronics under $100":
    "Here are some great electronics under $100:\n\n- **Anker Soundcore Life Q30** — Wireless headphones with ANC ($79.99)\n- **Logitech MX Keys Mini** — Compact wireless keyboard ($89.99)\n- **Amazon Echo Dot 5th Gen** — Smart speaker ($49.99)\n- **SanDisk 1TB Portable SSD** — Fast external storage ($94.99)\n\nI can filter by specific categories too. What interests you most?",
  "Compare your top headphones":
    'Let me compare our top 3 headphones:\n\n| Feature | Sony WH-1000XM5 | AirPods Max | Bose QC Ultra |\n|---------|-----------------|-------------|---------------|\n| Price | $348 | $549 | $429 |\n| ANC | Excellent | Excellent | Excellent |\n| Battery | 30h | 20h | 24h |\n| Weight | 250g | 384g | 250g |\n\nThe **Sony WH-1000XM5** offers the best value. The **AirPods Max** is best for Apple users. The **Bose QC Ultra** has the most comfortable fit.\n\nHere\'s a quick code snippet if you want to fetch product comparisons via our API:\n\n```javascript\nconst res = await fetch("/api/products?compare=headphones");\nconst data = await res.json();\nconsole.log(data.comparison);\n```\n\nWant me to add any of these to your cart?',
  "What's your return policy?":
    "Our return policy is straightforward:\n\n- **30-day returns** on all products\n- **Free return shipping** on orders over $50\n- **Full refund** to original payment method\n- Items must be in original packaging\n\nFor electronics, we also offer a **1-year warranty** through our partner service. Need help with a specific return?",
};

function getMockResponse(userMessage: string): string {
  // Check for exact match first
  if (mockResponses[userMessage]) return mockResponses[userMessage];

  // Simple keyword matching for demo
  const lower = userMessage.toLowerCase();
  if (lower.includes("best") || lower.includes("popular"))
    return mockResponses["What are your best-selling products?"];
  if (lower.includes("under") || lower.includes("cheap") || lower.includes("budget"))
    return mockResponses["Help me find electronics under $100"];
  if (lower.includes("compare") || lower.includes("headphone"))
    return mockResponses["Compare your top headphones"];
  if (lower.includes("return") || lower.includes("refund") || lower.includes("policy"))
    return mockResponses["What's your return policy?"];

  return mockResponses.default;
}

let nextId = 1;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isLoading) return;

      // Add user message
      const userMsg: Message = {
        id: `msg-${nextId++}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      // Simulate AI thinking delay (800ms–1500ms)
      const delay = 800 + Math.random() * 700;
      await new Promise((r) => setTimeout(r, delay));

      // Add AI response
      const aiMsg: Message = {
        id: `msg-${nextId++}`,
        role: "assistant",
        content: getMockResponse(content),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    },
    [input, isLoading]
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  return (
    /*
     * Full-height layout: fills viewport minus the 3.5rem navbar.
     * Flex column: header (sticky top) → messages (scrollable) → input (sticky bottom).
     * overflow-hidden prevents the page from scrolling past the chat.
     */
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <ChatHeader status={isLoading ? "thinking" : messages.length > 0 ? "online" : "idle"} />
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        onSuggestionClick={handleSuggestionClick}
      />
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => sendMessage()}
        isLoading={isLoading}
      />
    </div>
  );
}
