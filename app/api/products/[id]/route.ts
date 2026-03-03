import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { upsertProductEmbedding } from "@/lib/embeddings";

function isAdmin(userId: string | null | undefined) {
  return userId && userId === process.env.ADMIN_USER_ID;
}

const productUpdateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  image: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1),
  stock: z.number().int().min(0).default(0),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { image, ...rest } = parsed.data;
  const product = await db.product.update({
    where: { id: params.id },
    data: {
      ...rest,
      image: image || null,
    },
  });

  // Async — don't block the response
  upsertProductEmbedding(product.id).catch(() => {});

  return NextResponse.json(product);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
