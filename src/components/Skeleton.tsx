export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200/20 rounded-md ${className}`} />
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="w-full aspect-[3/4]" />
          <Skeleton className="w-3/4 h-4 mt-2" />
          <Skeleton className="w-1/2 h-4" />
        </div>
      ))}
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="w-full aspect-[3/4]" />
      <div className="flex flex-col gap-6 pt-4 md:pt-12">
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-1/4 h-8" />
        <div className="pt-6">
          <Skeleton className="w-1/4 h-4 mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="w-12 h-12" />)}
          </div>
        </div>
        <Skeleton className="w-full h-14 mt-4" />
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-24 h-24" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-1/4 h-4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
