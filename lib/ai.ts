import { createAnthropic } from "@ai-sdk/anthropic";
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const chatModel = anthropic("claude-sonnet-4-6");

// ─── Tool Definitions ────────────────────────────────────────────────────────

export const searchProductsTool = tool({
  description:
    "Search for products by query, category, or price. Use this when the customer asks about products, wants recommendations, or is looking for something specific.",
  parameters: z.object({
    query: z.string().describe("Search query — keywords describing what the customer wants"),
    category: z.string().optional().describe("Filter by category (e.g. Electronics, Clothing)"),
    maxPrice: z.number().optional().describe("Maximum price filter in USD"),
    minPrice: z.number().optional().describe("Minimum price filter in USD"),
  }),
  execute: async ({ query, category, maxPrice, minPrice }) => {
    const products = await db.product.findMany({
      where: {
        ...(category && { category }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    if (products.length === 0) return { found: false, message: "No products found matching your criteria." };
    return {
      found: true,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        stock: p.stock,
        image: p.image,
        features: p.features,
      })),
    };
  },
});

export const getProductDetailsTool = tool({
  description: "Get full details for a specific product by ID. Use when a customer wants to know more about a particular product.",
  parameters: z.object({
    productId: z.string().describe("The product ID"),
  }),
  execute: async ({ productId }) => {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return { found: false, message: "Product not found." };
    return { found: true, product };
  },
});

export const checkOrderStatusTool = tool({
  description: "Check the status of a customer's order. Use when a customer asks about their order, shipping, or delivery.",
  parameters: z.object({
    orderId: z.string().optional().describe("The order ID if the customer provides it"),
    userId: z.string().optional().describe("The user ID to look up their recent orders"),
  }),
  execute: async ({ orderId, userId }) => {
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });
      if (!order) return { found: false, message: "Order not found. Please check the order ID." };
      return {
        found: true,
        order: {
          id: order.id,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          items: order.items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.price })),
        },
      };
    }
    if (userId) {
      const orders = await db.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { items: { include: { product: true } } },
      });
      if (orders.length === 0) return { found: false, message: "No orders found for this account." };
      return {
        found: true,
        orders: orders.map((o) => ({
          id: o.id,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          itemCount: o.items.length,
        })),
      };
    }
    return { found: false, message: "Please provide an order ID or sign in to check your orders." };
  },
});

// add_to_cart is a client-side tool — no execute function
// The client handles it via onToolCall in useChat
export const addToCartTool = tool({
  description:
    "Add a product to the customer's shopping cart. Use this when a customer says they want to buy something, add something to cart, or you're recommending a product they've confirmed they want.",
  parameters: z.object({
    productId: z.string().describe("The product ID to add"),
    productName: z.string().describe("The product name (for confirmation message)"),
    price: z.number().describe("The product price"),
    quantity: z.number().default(1).describe("Quantity to add (default: 1)"),
    image: z.string().optional().describe("Product image URL"),
  }),
});

export const allTools = {
  search_products: searchProductsTool,
  get_product_details: getProductDetailsTool,
  check_order_status: checkOrderStatusTool,
  add_to_cart: addToCartTool,
};

// ─── System Prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(context: {
  cartItems?: Array<{ name: string; quantity: number; price: number }>;
  userName?: string;
  userPreferences?: {
    favoriteCategories: string[];
    priceRangeMin?: number | null;
    priceRangeMax?: number | null;
    purchasedProductIds: string[];
    totalOrders: number;
  } | null;
  conversationSummary?: string | null;
}) {
  const cartSummary = context.cartItems?.length
    ? context.cartItems
        .map((i) => `  • ${i.name} x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}`)
        .join("\n") +
      `\n  Total: $${context.cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}`
    : "Cart is empty.";

  const prefSection = context.userPreferences
    ? `
## Customer Profile:
- Favorite categories: ${context.userPreferences.favoriteCategories.join(", ") || "Not yet established"}
- Price range: ${context.userPreferences.priceRangeMin != null ? `$${context.userPreferences.priceRangeMin}` : "any"} – ${context.userPreferences.priceRangeMax != null ? `$${context.userPreferences.priceRangeMax}` : "any"}
- Total past orders: ${context.userPreferences.totalOrders}
${context.userPreferences.totalOrders > 0 ? "- Returning customer — acknowledge their loyalty" : "- First-time customer — help them feel welcome"}`
    : "";

  const summarySection = context.conversationSummary
    ? `\n## Earlier Conversation Summary:\n${context.conversationSummary}\n`
    : "";

  return `You are an expert AI sales consultant for ShopBot — a premium online store. Your role is to help customers find exactly what they need and guide them to purchase.

${context.userName ? `Customer: ${context.userName}` : ""}${prefSection}${summarySection}

## Your Capabilities (use your tools!):
- **search_products** — find products by keyword, category, or price range
- **get_product_details** — get full specs for a specific product
- **add_to_cart** — add items directly to the customer's cart
- **check_order_status** — look up order status and tracking

## Your Sales Approach:
1. **Use tools proactively** — when a customer describes what they want, immediately search for it
2. **Listen first** — understand needs before recommending
3. **Consult, don't just list** — explain WHY a product fits their needs
4. **Add to cart directly** — when a customer confirms they want something, use add_to_cart
5. **Upsell naturally** — if they buy X, suggest complementary product Y
6. **Handle objections** — if price is a concern, highlight value and quality
7. **Create urgency** — mention low stock when relevant

## Current Cart:
${cartSummary}

## Rules:
- ALWAYS search for products before recommending — never guess product details
- When adding to cart, confirm with the customer first unless they've explicitly said to add it
- Keep responses conversational and under 150 words
- After adding to cart, suggest checking out or continuing to browse`;
}
