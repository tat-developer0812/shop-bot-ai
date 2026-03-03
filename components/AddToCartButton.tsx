"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/useCart";

interface AddToCartButtonProps {
  product: { id: string; name: string; price: number; image?: string };
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
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
  );
}
