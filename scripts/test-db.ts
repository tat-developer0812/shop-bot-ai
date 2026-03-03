import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const db = new PrismaClient();

async function main() {
  console.log("DATABASE_URL →", process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":***@"));
  console.log("DIRECT_URL   →", process.env.DIRECT_URL?.replace(/:([^:@]+)@/, ":***@"));
  console.log("");

  // Test app connection (DATABASE_URL)
  try {
    await db.$connect();
    const count = await db.product.count();
    console.log("✓ App connection (DATABASE_URL): OK —", count, "products");
  } catch (e: any) {
    console.log("✗ App connection (DATABASE_URL):", e.message);
  } finally {
    await db.$disconnect();
  }

  // Test direct connection (DIRECT_URL) via prisma db pull
  console.log("");
  console.log("Testing DIRECT_URL via prisma db pull...");
  try {
    execSync("npx prisma db pull --force", { stdio: "inherit", env: { ...process.env, DATABASE_URL: process.env.DIRECT_URL } });
    console.log("✓ DIRECT_URL: OK");
  } catch (e: any) {
    console.log("✗ DIRECT_URL:", e.message);
  }
}

main().catch(console.error);
