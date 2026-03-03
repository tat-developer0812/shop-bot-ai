import { Suspense } from "react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { Hero } from "@/components/Hero";

interface HomeProps {
  searchParams: { category?: string; search?: string };
}

export default async function HomePage({ searchParams }: HomeProps) {
  const products = await db.product.findMany({
    where: {
      ...(searchParams.category && { category: searchParams.category }),
      ...(searchParams.search && {
        OR: [
          { name: { contains: searchParams.search, mode: "insensitive" } },
          { description: { contains: searchParams.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const showHero = !searchParams.category && !searchParams.search;

  return (
    <>
      {showHero && <Hero />}

      <div id="products" className="mx-auto max-w-screen-xl px-4 py-12 md:px-6">
        {/* Section header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="text-2xl tracking-tight text-foreground md:text-3xl"
  
            >
              {searchParams.category
                ? searchParams.category
                : searchParams.search
                ? `"${searchParams.search}"`
                : "Collection"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"} available
            </p>
          </div>

          <Suspense fallback={null}>
            <ProductFilters
              categories={categories.map((c) => c.category)}
              currentCategory={searchParams.category}
              currentSearch={searchParams.search}
            />
          </Suspense>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl text-muted-foreground/30">S</p>
            <p className="mt-4 text-base font-medium text-foreground">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
