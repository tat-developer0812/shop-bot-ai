import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Shield, Truck, RotateCcw } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductActions } from "@/components/ProductActions";

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/?category=${product.category}`}
          className="transition-colors hover:text-primary"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="max-w-[220px] truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-card">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-muted-foreground/20">
              S
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-primary">
              {product.category}
            </span>
            <h1 className="mt-2 text-2xl leading-snug tracking-tight text-foreground md:text-3xl">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <p className="font-display text-3xl font-semibold text-foreground">
              {formatPrice(product.price)}
            </p>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                product.stock > 0
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <p className="leading-relaxed text-muted-foreground">{product.description}</p>

          <ProductActions
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image ?? undefined,
            }}
            disabled={product.stock === 0}
          />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-border pt-6">
            {[
              { icon: Truck, label: "Free Shipping", sub: "On orders over $50" },
              { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free policy" },
              { icon: Shield, label: "Secure Checkout", sub: "SSL encrypted" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[11px] font-medium leading-tight text-foreground">
                  {label}
                </span>
                <span className="text-[10px] leading-tight text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
