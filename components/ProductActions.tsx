"use client";

import { useState } from "react";
import { ShoppingCart, Check, MessageCircle, Minus, Plus } from "lucide-react";
import { useCart } from "@/store/useCart";

interface ProductActionsProps {
  product: { id: string; name: string; price: number; image?: string };
  disabled?: boolean;
}

export function ProductActions({ product, disabled }: ProductActionsProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [chatClicked, setChatClicked] = useState(false);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAskAI = () => {
    window.dispatchEvent(
      new CustomEvent("open-chat", {
        detail: { message: `Tell me more about the ${product.name}` },
      })
    );
    setChatClicked(true);
  };

  return (
    <div className="space-y-3">
      {/* Quantity */}
      {!disabled && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Quantity</span>
          <div className="flex items-center rounded-lg border border-border bg-secondary">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-l-lg transition-colors hover:bg-border"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-r-lg transition-colors hover:bg-border"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 font-medium transition-all ${
          added
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground hover:shadow-glow"
        } disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            {disabled ? "Out of Stock" : "Add to Cart"}
          </>
        )}
      </button>

      {/* Ask AI */}
      <button
        onClick={handleAskAI}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-3.5 font-medium transition-all hover:border-primary/30 hover:bg-primary/[0.06]"
      >
        <MessageCircle className="h-5 w-5 text-primary" />
        {chatClicked ? "Chat opened!" : "Ask AI about this"}
      </button>
    </div>
  );
}
