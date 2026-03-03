import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { ProductForm } from "../../../ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  if (user.id !== process.env.ADMIN_USER_ID) redirect("/");

  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) redirect("/admin");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1
        className="mb-8 text-2xl tracking-tight text-foreground md:text-3xl"

      >
        Edit Product
      </h1>
      <ProductForm product={product} />
    </div>
  );
}
