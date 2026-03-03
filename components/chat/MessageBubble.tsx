"use client";

import { Bot, User, Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface MessageBubbleProps {
  message: Message;
}

/**
 * Parses message content and splits out fenced code blocks.
 * Returns an array of { type: "text" | "code", content, lang? } segments.
 */
function parseContent(raw: string) {
  const segments: { type: "text" | "code"; content: string; lang?: string }[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    // Text before this code block
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: raw.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", content: match[2].trimEnd(), lang: match[1] || undefined });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < raw.length) {
    segments.push({ type: "text", content: raw.slice(lastIndex) });
  }

  return segments;
}

function CodeBlock({ content, lang }: { content: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-2 overflow-hidden rounded-lg border border-border">
      {/* Header bar */}
      {lang && (
        <div className="flex items-center justify-between border-b border-border bg-secondary/80 px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {lang}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      {/* Code content */}
      <pre className="overflow-x-auto bg-[hsl(30_6%_9%)] p-3 text-[13px] leading-relaxed">
        <code className="font-mono text-foreground/90">{content}</code>
      </pre>
      {/* Copy button if no lang header */}
      {!lang && (
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-secondary opacity-0 transition-opacity group-hover:opacity-100"
        >
          {copied ? (
            <Check className="h-3 w-3 text-accent" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const segments = useMemo(() => parseContent(message.content), [message.content]);

  return (
    <div
      className={`flex gap-3 animate-fade-up ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
          isUser ? "bg-primary/15" : "bg-primary/10"
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-primary" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Role label */}
        <p
          className={`mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {isUser ? "You" : "ShopBot AI"}
        </p>

        <div
          className={`overflow-hidden rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border border-border/60 bg-card text-card-foreground"
          }`}
        >
          {segments.map((seg, i) =>
            seg.type === "code" ? (
              <CodeBlock key={i} content={seg.content} lang={seg.lang} />
            ) : (
              <span key={i} className="whitespace-pre-wrap">
                {seg.content}
              </span>
            )
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <p
            className={`mt-1 text-[10px] text-muted-foreground/50 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
