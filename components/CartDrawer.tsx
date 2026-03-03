"use client";

import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useCartDrawer } from "@/store/useCartDrawer";
import { formatPrice } from "@/lib/utils";

const SHIPPING_THRESHOLD = 50;

export function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { items, removeItem, updateQuantity, total } = useCart();
  const cartTotal = total();
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - cartTotal);
  const progress = Math.min(100, (cartTotal / SHIPPING_THRESHOLD) * 100);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        {/* Backdrop — Radix handles focus trap + esc-to-close automatically */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

        {/* Panel — slides in from right */}
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-background shadow-drawer outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <ShoppingBag className="h-[18px] w-[18px] text-primary" />
              Cart
              {items.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length})
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Shipping progress */}
          {items.length > 0 && (
            <div className="border-b border-border bg-secondary/50 px-5 py-3">
              <p className="mb-2 text-xs text-muted-foreground">
                {toFreeShipping > 0 ? (
                  <>
                    Add{" "}
                    <span className="font-semibold text-primary">
                      {formatPrice(toFreeShipping)}
                    </span>{" "}
                    more for free shipping
                  </>
                ) : (
                  <span className="font-medium text-accent">
                    Free shipping unlocked!
                  </span>
                )}
              </p>
              <div className="h-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Discover something you&apos;ll love
                  </p>
                </div>
                <Dialog.Close asChild>
                  <Link
                    href="/"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Browse collection &rarr;
                  </Link>
                </Dialog.Close>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                          S
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-1">
                        <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-1 flex-shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-l-md transition-colors hover:bg-secondary"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-r-md transition-colors hover:bg-secondary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="space-y-3 border-t border-border bg-card px-5 py-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className={toFreeShipping === 0 ? "font-medium text-accent" : ""}>
                  {toFreeShipping === 0 ? "Free" : "Calculated at checkout"}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-semibold text-foreground">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <Dialog.Close asChild>
                <Link
                  href="/cart"
                  className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
                >
                  View Cart & Checkout
                </Link>
              </Dialog.Close>
              <Dialog.Close className="block w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground">
                Continue shopping
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
