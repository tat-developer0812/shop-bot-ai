"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, ImagePlus, ThumbsUp, ThumbsDown, ShoppingCart } from "lucide-react";
import { useCart } from "@/store/useCart";
import { cn } from "@/lib/utils";
import type { Message } from "ai";

const SESSION_KEY = "chat_session_id";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function MessageContent({ message, onFeedback, feedbackGiven }: {
  message: Message;
  onFeedback?: (messageId: string, rating: number) => void;
  feedbackGiven?: boolean;
}) {
  const isAssistant = message.role === "assistant";

  // Check for tool invocations (add_to_cart shows a cart badge)
  const toolInvocations = message.toolInvocations ?? [];
  const cartAdds = toolInvocations.filter(
    (t) => t.toolName === "add_to_cart" && t.state === "result"
  );

  return (
    <div className={cn("flex gap-2 group", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && (
        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div className="flex max-w-[80%] flex-col gap-1">
        {/* Cart add notifications */}
        {cartAdds.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1.5 text-xs text-accent"
          >
            <ShoppingCart className="h-3 w-3" />
            <span>Added to cart</span>
          </div>
        ))}

        {/* Main message bubble */}
        {message.content && (
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
              isAssistant
                ? "rounded-tl-sm bg-card text-card-foreground"
                : "rounded-tr-sm bg-primary text-primary-foreground"
            )}
          >
            {message.content}
          </div>
        )}

        {/* Feedback buttons for assistant messages */}
        {isAssistant && message.content && onFeedback && (
          <div className={cn(
            "flex items-center gap-1 transition-opacity",
            feedbackGiven ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            {feedbackGiven ? (
              <span className="text-[10px] text-muted-foreground">Thanks for the feedback</span>
            ) : (
              <>
                <button
                  onClick={() => onFeedback(message.id, 1)}
                  className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-accent"
                  title="Good response"
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, -1)}
                  className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-destructive"
                  title="Poor response"
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {!isAssistant && (
        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(getSessionId);
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { items, addItem } = useCart();

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/chat",
    body: {
      sessionId,
      cartItems: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      ...(pendingImage && {
        imageBase64: pendingImage.base64,
        imageMimeType: pendingImage.mimeType,
      }),
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome. I'm your personal shopping assistant. I can search products, add items to your cart, and help you find exactly what you need. What are you looking for?",
      },
    ],
    // Handle client-side tools (add_to_cart)
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "add_to_cart") {
        const args = toolCall.args as {
          productId: string;
          productName: string;
          price: number;
          quantity?: number;
          image?: string;
        };
        addItem({
          id: args.productId,
          name: args.productName,
          price: args.price,
          image: args.image,
        });
        // If quantity > 1, add more
        if (args.quantity && args.quantity > 1) {
          for (let i = 1; i < args.quantity; i++) {
            addItem({ id: args.productId, name: args.productName, price: args.price, image: args.image });
          }
        }
        return { success: true, message: `Added ${args.productName} to cart` };
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      setIsOpen(true);
      setInput(detail.message);
    };
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, [setInput]);

  // Clear image after submission
  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      handleSubmit(e);
      setPendingImage(null);
    },
    [handleSubmit]
  );

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setPendingImage({ base64, mimeType: file.type, preview: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleFeedback = useCallback(async (messageId: string, rating: number) => {
    setFeedbackGiven((prev) => ({ ...prev, [messageId]: true }));
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating, sessionId }),
      });
    } catch {
      // Non-critical — feedback failure shouldn't disrupt UX
    }
  }, [sessionId]);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          isOpen
            ? "bg-card text-foreground border border-border"
            : "bg-primary text-primary-foreground hover:shadow-glow"
        )}
        aria-label="Chat with AI"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-20 right-5 z-50 flex w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-200",
          isOpen ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
        style={{ maxHeight: "560px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">ShopBot AI</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-[11px] text-muted-foreground">Agentic · Can search & add to cart</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: "200px", maxHeight: "350px" }}>
          {messages.map((m) => (
            <MessageContent
              key={m.id}
              message={m}
              onFeedback={handleFeedback}
              feedbackGiven={feedbackGiven[m.id]}
            />
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-2.5">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {pendingImage && (
          <div className="flex items-center gap-2 border-t border-border px-4 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage.preview}
              alt="Selected"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="flex-1 text-xs text-muted-foreground">Image attached</span>
            <button
              onClick={() => setPendingImage(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 border-t border-border px-4 py-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Upload image to search"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything..."
            className="min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !pendingImage)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:shadow-glow disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </>
  );
}
