import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { AdminProductActions } from "./AdminProductActions";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  if (user.id !== process.env.ADMIN_USER_ID) redirect("/");
}

export default async function AdminPage() {
  await requireAdmin();

  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-foreground md:text-3xl">
          Products
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/analytics"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Analytics
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-glow"
          >
            + New Product
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              <th className="hidden p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                Category
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Price
              </th>
              <th className="hidden p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                Stock
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr
                key={product.id}
                className="bg-card transition-colors hover:bg-secondary/50"
              >
                <td className="p-4 font-medium text-foreground">{product.name}</td>
                <td className="hidden p-4 text-muted-foreground md:table-cell">
                  {product.category}
                </td>
                <td className="p-4 text-foreground">{formatPrice(product.price)}</td>
                <td className="hidden p-4 sm:table-cell">
                  <span
                    className={`text-sm ${
                      product.stock > 0 ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <AdminProductActions productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">No products yet.</p>
        )}
      </div>
    </div>
  );
}
