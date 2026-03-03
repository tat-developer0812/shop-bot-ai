"use client";

import { useState } from "react";
import { Settings, ChevronDown, Check } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface ChatHeaderProps {
  status: "idle" | "thinking" | "online";
}

const statusConfig = {
  idle: { label: "Ready", dot: "bg-muted-foreground" },
  online: { label: "Online", dot: "bg-accent" },
  thinking: { label: "Thinking...", dot: "bg-primary animate-pulse" },
};

const models = ["GPT-4o", "Claude Sonnet", "Claude Haiku"] as const;

export function ChatHeader({ status }: ChatHeaderProps) {
  const [model, setModel] = useState<string>(models[0]);
  const cfg = statusConfig[status];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      {/* Left — name + status */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <span className="text-sm font-bold text-primary">AI</span>
        </div>
        <div>
          <h1 className="font-display text-[15px] leading-tight tracking-tight text-foreground">
            ShopBot AI
          </h1>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            <span className="text-[11px] text-muted-foreground">{cfg.label}</span>
          </div>
        </div>
      </div>

      {/* Right — model selector + settings */}
      <div className="flex items-center gap-1">
        {/* Radix DropdownMenu for accessible model selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground outline-none">
              {model}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-fade-up"
            >
              {models.map((m) => (
                <DropdownMenu.Item
                  key={m}
                  onSelect={() => setModel(m)}
                  className="flex cursor-pointer items-center px-3 py-2 text-xs text-muted-foreground outline-none transition-colors data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
                >
                  {m}
                  {model === m && (
                    <Check className="ml-auto h-3 w-3 text-primary" />
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
