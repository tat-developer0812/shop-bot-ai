"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface AskAboutProductButtonProps {
  productName: string;
}

export function AskAboutProductButton({ productName }: AskAboutProductButtonProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent("open-chat", {
        detail: { message: `Tell me more about the ${productName}` },
      })
    );
    setClicked(true);
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-medium transition-all hover:border-primary/30 hover:bg-primary/[0.06]"
    >
      <MessageCircle className="h-5 w-5 text-primary" />
      {clicked ? "Chat opened!" : "Ask about this product"}
    </button>
  );
}
