import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stripe, isStripeEnabled } from "@/lib/stripe";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export async function POST(req: Request) {
  if (!isStripeEnabled() || !stripe) {
    return NextResponse.json(
      { error: "Payments not configured. Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY." },
      { status: 501 }
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to checkout." }, { status: 401 });
  }

  const { items }: { items: CartItem[] } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Verify prices against DB (never trust client-provided prices)
  const productIds = items.map((i) => i.id);
  const dbProducts = await db.product.findMany({ where: { id: { in: productIds } } });
  const priceMap = Object.fromEntries(dbProducts.map((p) => [p.id, p]));

  const lineItems = items.map((item) => {
    const product = priceMap[item.id];
    if (!product) throw new Error(`Product ${item.id} not found`);

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          ...(product.image ? { images: [product.image] } : {}),
        },
        unit_amount: Math.round(product.price * 100), // cents
      },
      quantity: item.quantity,
    };
  });

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Create a pending order first, then link it after payment
  const total = items.reduce((sum, item) => {
    const product = priceMap[item.id];
    return sum + (product?.price ?? item.price) * item.quantity;
  }, 0);

  const order = await db.order.create({
    data: {
      userId: user.id,
      total,
      status: "PENDING",
      items: {
        create: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: priceMap[item.id]?.price ?? item.price,
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}/orders?success=1&orderId=${order.id}`,
    cancel_url: `${origin}/cart?cancelled=1`,
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
    customer_email: user.email,
  });

  // Link stripe session ID to order
  await db.order.update({
    where: { id: order.id },
    data: { stripeId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
