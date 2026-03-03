"use client";

import { useState } from "react";
import { useCart } from "@/store/useCart";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const { items } = useCart();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Stripe not configured — fall back to direct order placement
        if (res.status === 501) {
          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });
          if (!orderRes.ok) {
            const err = await orderRes.json().catch(() => ({}));
            throw new Error(err.error || "Order failed");
          }
          window.location.href = "/orders";
          return;
        }
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      alert(message + ". Please sign in and try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || items.length === 0}
      className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? "Redirecting to checkout..." : "Checkout"}
    </button>
  );
}
