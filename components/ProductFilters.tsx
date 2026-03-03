"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  categories: string[];
  currentCategory?: string;
  currentSearch?: string;
}

export function ProductFilters({ categories, currentCategory }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCategory = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
      {["All", ...categories].map((cat) => {
        const isActive = cat === "All" ? !currentCategory : currentCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => setCategory(cat === "All" ? null : cat)}
            className={cn(
              "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-glow"
                : "border border-border bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
