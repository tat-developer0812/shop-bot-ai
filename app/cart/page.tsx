"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, Minus, Plus, Truck } from "lucide-react";
import { useCart } from "@/store/useCart";
import { formatPrice } from "@/lib/utils";
import { CheckoutButton } from "@/components/CheckoutButton";

const SHIPPING_THRESHOLD = 50;

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const cartTotal = total();
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - cartTotal);
  const progress = Math.min(100, (cartTotal / SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-24 text-center md:px-6">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl text-foreground">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6">
      <h1 className="mb-8 text-2xl tracking-tight text-foreground md:text-3xl">
        Shopping Cart
        <span className="ml-3 font-body text-lg font-normal text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                    S
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-medium text-foreground">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-l-md transition-colors hover:bg-secondary"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-r-md transition-colors hover:bg-secondary"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold text-foreground">Order Summary</h2>

            {/* Shipping bar */}
            <div className="mb-4 rounded-lg bg-secondary p-3">
              <div className="mb-2 flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <p className="text-xs">
                  {toFreeShipping > 0 ? (
                    <>
                      Add{" "}
                      <span className="font-semibold text-primary">
                        {formatPrice(toFreeShipping)}
                      </span>{" "}
                      for free shipping
                    </>
                  ) : (
                    <span className="font-medium text-accent">Free shipping unlocked</span>
                  )}
                </p>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-muted-foreground">
                  <span className="mr-2 truncate">{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className={toFreeShipping === 0 ? "font-medium text-accent" : ""}>
                  {toFreeShipping === 0 ? "Free" : "From $5.99"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <div className="mt-4">
              <CheckoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
