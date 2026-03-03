import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, { label: string; class: string }> = {
  PENDING: { label: "Pending", class: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
  PAID: { label: "Paid", class: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  SHIPPED: { label: "Shipped", class: "border-violet-500/30 bg-violet-500/10 text-violet-400" },
  DELIVERED: { label: "Delivered", class: "border-accent/30 bg-accent/10 text-accent" },
  CANCELLED: { label: "Cancelled", class: "border-destructive/30 bg-destructive/10 text-destructive" },
};

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl tracking-tight text-foreground md:text-3xl">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your order history will appear here.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusStyle[order.status] ?? {
              label: order.status,
              class: "border-border bg-secondary text-muted-foreground",
            };
            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Header */}
                <div className="flex items-center justify-between bg-secondary/50 px-5 py-3.5">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Order
                      </p>
                      <p className="font-mono text-sm font-semibold text-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Date
                      </p>
                      <p className="text-sm text-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.class}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-border px-5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted-foreground">
                            S
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="flex-shrink-0 text-sm font-medium text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-5 py-3">
                  <span className="text-sm text-muted-foreground">Order total</span>
                  <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
