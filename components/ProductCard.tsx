"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@prisma/client";
import { useCart } from "@/store/useCart";
import { formatPrice } from "@/lib/utils";

const categoryColor: Record<string, string> = {
  Electronics: "text-blue-400",
  Fashion: "text-pink-400",
  Home: "text-amber-400",
  Sports: "text-emerald-400",
  Books: "text-violet-400",
  Food: "text-orange-400",
  Beauty: "text-rose-400",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const color = categoryColor[product.category] ?? "text-muted-foreground";

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/25 hover:shadow-card-hover">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block shrink-0">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground/40">
              S
            </div>
          )}
          {/* Subtle dark overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                Sold out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <span className={`text-[11px] font-medium uppercase tracking-wider ${color}`}>
          {product.category}
        </span>

        <Link href={`/products/${product.id}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || added}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
              added
                ? "bg-accent text-accent-foreground"
                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            } disabled:cursor-not-allowed disabled:opacity-30`}
            title={added ? "Added!" : "Add to cart"}
          >
            {added ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
