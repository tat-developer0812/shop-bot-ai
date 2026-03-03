export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-square shimmer" />
      <div className="space-y-2.5 p-3.5">
        <div className="h-3 w-16 rounded-full shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-14 rounded shimmer" />
          <div className="h-8 w-8 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
