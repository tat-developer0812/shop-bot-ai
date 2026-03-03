"use client";

import { useRef, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Message ShopBot AI...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    // Clamp to max ~5 lines (approx 160px)
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends, Shift+Enter inserts newline
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isLoading) {
          onSubmit();
        }
      }
    },
    [value, isLoading, onSubmit]
  );

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="sticky bottom-0 border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
        {/* Input container */}
        <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 transition-colors focus-within:border-primary/30">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="max-h-[160px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          {/* Send button */}
          <button
            onClick={() => {
              if (canSend) onSubmit();
            }}
            disabled={!canSend}
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
              canSend
                ? "bg-primary text-primary-foreground hover:shadow-glow"
                : "bg-secondary text-muted-foreground"
            }`}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
          <kbd className="rounded border border-border/50 bg-secondary px-1 py-0.5 font-mono text-[9px]">
            Enter
          </kbd>{" "}
          to send &middot;{" "}
          <kbd className="rounded border border-border/50 bg-secondary px-1 py-0.5 font-mono text-[9px]">
            Shift + Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
