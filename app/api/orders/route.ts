import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

async function updateUserPreferences(
  userId: string,
  items: Array<{ id: string; price: number }>
) {
  try {
    // Gather categories and price data from the purchased products
    const products = await db.product.findMany({
      where: { id: { in: items.map((i) => i.id) } },
      select: { id: true, category: true, price: true },
    });

    const categories = products.map((p) => p.category);
    const prices = products.map((p) => p.price);
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const productIds = products.map((p) => p.id);

    const existing = await db.userPreferences.findUnique({ where: { userId } });

    if (existing) {
      const mergedCategories = Array.from(new Set([...existing.favoriteCategories, ...categories]));
      const mergedProductIds = Array.from(new Set([...existing.purchasedProductIds, ...productIds]));
      const newMin = existing.priceRangeMin != null
        ? Math.min(existing.priceRangeMin, avgPrice * 0.7)
        : avgPrice * 0.7;
      const newMax = existing.priceRangeMax != null
        ? Math.max(existing.priceRangeMax, avgPrice * 1.5)
        : avgPrice * 1.5;

      await db.userPreferences.update({
        where: { userId },
        data: {
          favoriteCategories: mergedCategories,
          purchasedProductIds: mergedProductIds,
          priceRangeMin: Math.round(newMin),
          priceRangeMax: Math.round(newMax),
          totalOrders: { increment: 1 },
        },
      });
    } else {
      await db.userPreferences.create({
        data: {
          userId,
          favoriteCategories: categories,
          purchasedProductIds: productIds,
          priceRangeMin: Math.round(avgPrice * 0.7),
          priceRangeMax: Math.round(avgPrice * 1.5),
          totalOrders: 1,
        },
      });
    }
  } catch (err) {
    console.error("Failed to update user preferences:", err);
  }
}

interface CartItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const items: CartItemPayload[] = body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await db.order.create({
    data: {
      userId: user.id,
      total,
      status: "PENDING",
      items: {
        create: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });

  // Update preferences asynchronously — don't block response
  updateUserPreferences(user.id, items).catch(() => {});

  return NextResponse.json(order, { status: 201 });
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
