"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
  stock: number;
}

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    image: product?.image ?? "",
    category: product?.category ?? "",
    stock: product?.stock?.toString() ?? "0",
  });

  const isEdit = Boolean(product);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        image: form.image || undefined,
        category: form.category,
        stock: parseInt(form.stock, 10) || 0,
      };

      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const fields: { label: string; name: keyof typeof form; type?: string; textarea?: boolean }[] = [
    { label: "Name", name: "name" },
    { label: "Description", name: "description", textarea: true },
    { label: "Price (USD)", name: "price", type: "number" },
    { label: "Category", name: "category" },
    { label: "Image URL", name: "image" },
    { label: "Stock", name: "stock", type: "number" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map(({ label, name, type, textarea }) => (
        <div key={name}>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
          {textarea ? (
            <textarea
              name={name}
              value={form[name]}
              onChange={handleChange}
              rows={4}
              required={name !== "image"}
              className="w-full resize-none rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          ) : (
            <input
              name={name}
              type={type ?? "text"}
              value={form[name]}
              onChange={handleChange}
              required={name !== "image"}
              step={type === "number" && name === "price" ? "0.01" : undefined}
              min={type === "number" ? "0" : undefined}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-xl border border-border px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
