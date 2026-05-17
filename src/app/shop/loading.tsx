import { ProductGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
      <div className="flex justify-between items-end mb-8 border-b border-muted pb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-playfair font-black tracking-tight mb-2 uppercase">
            Shop
          </h1>
          <p className="text-muted tracking-widest text-sm uppercase">
            Loading archive...
          </p>
        </div>
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
