import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const products = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium over-ear headphones with 30hr battery life and active noise cancellation.",
    price: 149.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    stock: 25,
  },
  {
    name: "Ergonomic Office Chair",
    description: "Lumbar support, adjustable armrests, breathable mesh back for all-day comfort.",
    price: 299.99,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
    stock: 10,
  },
  {
    name: "Mechanical Keyboard",
    description: "TKL layout with Cherry MX switches, RGB backlight, and aluminum frame.",
    price: 89.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=600",
    stock: 40,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-wall insulated, keeps drinks cold 24h and hot 12h. BPA-free.",
    price: 24.99,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
    stock: 100,
  },
  {
    name: "Running Shoes",
    description: "Lightweight, responsive cushioning with breathable mesh upper. Unisex sizing.",
    price: 79.99,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    stock: 30,
  },
  {
    name: "Smart Watch",
    description: "Health tracking, GPS, 7-day battery, and works with iOS & Android.",
    price: 199.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    stock: 15,
  },
  {
    name: "Minimalist Backpack",
    description: "15L capacity, water-resistant, fits 13\" laptop. Perfect for commuters.",
    price: 49.99,
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    stock: 50,
  },
  {
    name: "Yoga Mat",
    description: "6mm thick, non-slip surface, with carrying strap. Eco-friendly TPE material.",
    price: 34.99,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600",
    stock: 60,
  },
];

async function main() {
  console.log("Seeding database...");
  await db.product.deleteMany();
  await db.product.createMany({ data: products });
  console.log(`Created ${products.length} products.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
