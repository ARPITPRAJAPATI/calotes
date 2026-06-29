// Core single skeleton node using animate-pulse keyframe fade intervals
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200/20 rounded-md ${className}`} />
  );
}

// Layout placeholder wireframe displayed while product indexes fetch from database
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {/* Create an array mapping 8 mockup placeholders */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          {/* Main product aspect boundary */}
          <Skeleton className="w-full aspect-[3/4]" />
          {/* Mock title text block */}
          <Skeleton className="w-3/4 h-4 mt-2" />
          {/* Mock price text block */}
          <Skeleton className="w-1/2 h-4" />
        </div>
      ))}
    </div>
  );
}

// Layout placeholder wireframe displayed on product details routing delay
export function ProductPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-7xl mx-auto px-4 py-8">
      {/* Product Image Frame */}
      <Skeleton className="w-full aspect-[3/4]" />
      {/* Product Information Column */}
      <div className="flex flex-col gap-6 pt-4 md:pt-12">
        <Skeleton className="w-1/3 h-6" /> {/* Category label */}
        <Skeleton className="w-full h-12" /> {/* Title text */}
        <Skeleton className="w-1/4 h-8" />  {/* Price text */}
        {/* Mock sizing selection buttons */}
        <div className="pt-6">
          <Skeleton className="w-1/4 h-4 mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="w-12 h-12" />)}
          </div>
        </div>
        <Skeleton className="w-full h-14 mt-4" /> {/* Checkout action CTA */}
      </div>
    </div>
  );
}

// Layout placeholder wireframe displayed on cart contents loading/hydration delay
export function CartSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-24 h-24" /> {/* Image thumbnail placeholder */}
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="w-3/4 h-4" /> {/* Title text block */}
            <Skeleton className="w-1/2 h-4" /> {/* Size text block */}
            <Skeleton className="w-1/4 h-4 mt-2" /> {/* Pricing block */}
          </div>
        </div>
      ))}
    </div>
  );
}

