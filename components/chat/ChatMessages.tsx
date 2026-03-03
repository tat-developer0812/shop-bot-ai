"use client";

import { useEffect, useRef } from "react";
import { Bot, Sparkles } from "lucide-react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { MessageBubble, type Message } from "./MessageBubble";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick?: (text: string) => void;
}

const suggestions = [
  "What are your best-selling products?",
  "Help me find electronics under $100",
  "Compare your top headphones",
  "What's your return policy?",
];

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-up">
      <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Bot className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          ShopBot AI
        </p>
        <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md border border-border/60 bg-card px-4 py-3">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick?: (text: string) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-xl tracking-tight text-foreground md:text-2xl">
        How can I help you?
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Ask me anything about products, orders, or recommendations.
        I&apos;m here to help you shop smarter.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick?.(s)}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.06] hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatMessages({
  messages,
  isLoading,
  onSuggestionClick,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <ScrollArea.Root className="flex-1 overflow-hidden">
      <ScrollArea.Viewport className="h-full w-full">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
          {!hasMessages ? (
            <EmptyState onSuggestionClick={onSuggestionClick} />
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea.Viewport>

      {/* Custom styled scrollbar via Radix */}
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="flex w-1.5 touch-none select-none p-px transition-colors"
      >
        <ScrollArea.Thumb className="relative flex-1 rounded-full bg-border hover:bg-muted-foreground/30" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
