"use client"; // Flags this file as a client component to handle browser states (search inputs, filters, layout drawer animations)

// Import React hooks for managing state variables, side effect triggers, and suspense boundaries
import { useState, useEffect, Suspense } from "react";
// Import Framer Motion animation triggers
import { motion, AnimatePresence } from "framer-motion";
// Import UI vector icon components
import { X, SlidersHorizontal, Loader2, ArrowRight, Search, Heart } from "lucide-react";
// Import Link for page transitions
import Link from "next/link";
// Import hook to access query parameters from URL safely in Client Components
import { useSearchParams } from "next/navigation";
// Import carousel image viewer component
import ProductImageSlider from "@/components/ProductImageSlider";
// Import Types definitions for Product schema validation
import { Product } from "@/types";
// Import wishlist hook managers
import { useWishlist } from "@/context/WishlistContext";

// Config static category options mapping filters
const CATEGORIES = [
  { name: "All Items", slug: "all" },
  { name: "Denim",       slug: "denim" },
  { name: "Outerwear",   slug: "outerwear" },
  { name: "Oversized",   slug: "oversized" },
  { name: "Plus Size",   slug: "plus-size" },
  { name: "Accessories", slug: "accessories" },
];

function ShopContent() {
  const searchParams   = useSearchParams(); // Reads active URL search parameters (requires Suspense parent container wrap)
  const initialCat     = searchParams.get("category") || "all"; // Extracted default category filter
  const { toggleWishlist, isInWishlist } = useWishlist(); // Extract wishlist context controls

  // Component states
  const [products,      setProducts]      = useState<Product[]>([]); // Holds list of fetched items matching query filters
  const [loading,       setLoading]       = useState(true);          // Controls loading screen overlays
  const [isFilterOpen,  setIsFilterOpen]  = useState(false);         // Controls visibility of mobile filter panel drawers
  const [activeCategory, setActiveCategory] = useState(initialCat);    // Track active category filters selection
  const [searchQuery,   setSearchQuery]    = useState("");           // Holds user typed search queries

  // Debounced side-effect trigger: waits 300ms after user finishes typing before executing API fetch
  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(); // Query API products
    }, 300);
    return () => clearTimeout(delayDebounceFn); // Clear debounced timer on text changes
  }, [activeCategory, searchQuery]);

  // Method executing fetch requests to retrieve list of matched products from MongoDB collection API route
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = activeCategory === "all"
        ? "/api/products"
        : `/api/products?category=${activeCategory}`;
      
      // Append query parameters if search input is populated
      if (searchQuery) {
        url += (url.includes("?") ? "&" : "?") + `q=${encodeURIComponent(searchQuery)}`;
      }
      
      const res  = await fetch(url, { cache: 'no-store' }); // Disable fetch cache queries to fetch fresh inventory
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setProducts(data); // Bind list data
      } else {
        setProducts([]);
        console.error(`API error (status ${res.status}):`, data);
      }
    } catch (e) {
      setProducts([]);
      console.error(e);
    } finally {
      setLoading(false); // Stop loading indicator animations
    }
  };

  return (
    <>
      {/* ── Page header ── */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto mt-[-20px] mb-4">
        <div className="border-b border-border pb-4 mb-4">
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="section-label mb-1"
          >
            The Vault
          </motion.p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="font-display font-bold text-4xl md:text-6xl lg:text-[6vw] uppercase tracking-tight leading-[0.82] text-text"
            >
              Items
            </motion.h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              {/* Search Bar text input */}
              <div className="relative w-full md:w-64 lg:w-80 group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-terracotta transition-colors" />
                <input
                  type="text"
                  placeholder="Search pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-warm border border-border px-10 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-terracotta transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} // Clear search input
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Counter and filter togglers */}
              <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
                <p className="section-label hidden md:block">{products.length} pieces</p>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 btn-primary px-4 py-2 text-[10px]"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category Horizontal Tabs (Mobile viewport layout) ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`shrink-0 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-2 border transition-all duration-300 ${
                activeCategory === cat.slug
                  ? "border-terracotta text-terracotta bg-terracotta/5"
                  : "border-border text-muted hover:border-border-warm hover:text-text"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout: sidebar + grid ── */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex gap-10 lg:gap-14">

        {/* Desktop Sidebar navigation filters */}
        <aside className="hidden lg:block w-44 shrink-0 sticky top-28 h-max">
          <h3 className="section-label mb-6 border-b border-border pb-4">Curations</h3>
          <ul className="space-y-4">
            {CATEGORIES.map(cat => (
              <li key={cat.slug}>
                <button
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-bold w-full text-left transition-all group ${
                    activeCategory === cat.slug ? "text-terracotta" : "text-muted hover:text-text"
                  }`}
                >
                  {/* Sliding underline visual indicators */}
                  <span className={`h-px transition-all duration-700 ${
                    activeCategory === cat.slug ? "w-8 bg-terracotta" : "w-0 group-hover:w-3 bg-muted"
                  }`} />
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product listings grid area */}
        <div className="flex-1 pb-24">
          {loading ? (
            // Loading Spinner Loader frame
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
              <p className="section-label">Curating items…</p>
            </div>
          ) : products.length === 0 ? (
            // Empty listings placeholder fallbacks
            <div className="h-[50vh] flex flex-col items-center justify-center gap-6 border border-border">
              <p className="section-label">No pieces in this category.</p>
              <button onClick={() => setActiveCategory("all")} className="btn-outline">
                View All
              </button>
            </div>
          ) : (
            // Render grid elements
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 md:gap-x-5 gap-y-10 md:gap-y-14"
            >
              {products.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  // Apply cascade delay animations based on map index locations
                  transition={{ delay: idx * 0.05, ease: [0.16,1,0.3,1] }}
                  className="product-card group relative"
                >
                  {/* Pinned Wishlist toggle overlay button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist({
                        productId: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.images[0],
                        slug: product.slug,
                        // Parse categories accurately checking nested objects types
                        category: typeof product.category === 'object' && product.category ? (product.category as any).name : "Vintage",
                      });
                    }}
                    className="absolute top-2.5 right-2.5 z-30 p-1 text-text hover:text-terracotta hover:scale-110 transition-all duration-300 cursor-pointer"
                    style={{ border: 'none', background: 'transparent', outline: 'none', boxShadow: 'none' }}
                    title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart 
                      size={15} 
                      className={isInWishlist(product._id) ? "fill-terracotta text-terracotta" : "text-text"} 
                      strokeWidth={2}
                    />
                  </button>

                  <Link href={`/shop/product/${product.slug}`}>
                    {/* Image Viewport Frame */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-bg-warm">
                      {product.compareAtPrice ? (
                        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5 items-start">
                          <span className="text-[7px] font-bold uppercase tracking-widest bg-terracotta/90 text-bg px-2 py-0.5 shadow-sm">
                            Sale
                          </span>
                          <span className="text-[7px] font-bold uppercase tracking-widest bg-bg/85 backdrop-blur-[2px] text-muted px-2 py-0.5 shadow-sm">
                            {product.condition || "Pre-Loved"}
                          </span>
                        </div>
                      ) : (
                        <span className="absolute top-2 left-2 z-20 text-[7px] font-bold uppercase tracking-widest bg-bg/85 backdrop-blur-[2px] text-muted px-2 py-0.5 shadow-sm">
                          {product.condition || "Pre-Loved"}
                        </span>
                      )}

                      {/* Display SOLD OUT overlay on depleted product stocks */}
                      {product.stock !== undefined && product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-20 flex items-center justify-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-bg text-text px-4 py-2 border border-border">
                            SOLD
                          </span>
                        </div>
                      )}
                      <ProductImageSlider 
                        images={product.images} 
                        productName={product.name} 
                        isSoldOut={product.stock !== undefined && product.stock <= 0} 
                      />
                    </div>
                    {/* Information Footer */}
                    <div className="mt-3 space-y-1">
                      <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-wide leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-[7px] md:text-[8px] text-muted font-medium uppercase tracking-widest">
                          {product.brand}
                        </p>
                        <p className="text-[9px] md:text-[10px] font-black text-terracotta">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Mobile floating filter toggle button ── */}
      <div className="fixed bottom-8 right-5 z-40 lg:hidden">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-12 h-12 bg-terracotta text-bg rounded-full shadow-2xl flex items-center justify-center"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* ── Mobile Filter Drawer Panel Modal ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop Blur panel overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-[100]"
              onClick={() => setIsFilterOpen(false)}
            />
            {/* Drawer layout */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-bg-warm border-l border-border-warm z-[101] flex flex-col"
            >
              <div className="flex justify-between items-center px-8 py-6 border-b border-border">
                <h2 className="section-label">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X size={20} className="text-muted hover:text-text transition-colors" />
                </button>
              </div>

              {/* Scrollable checklist items */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
                <div>
                  <h3 className="section-label mb-5">Categories</h3>
                  <div className="space-y-3">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.slug}
                        onClick={() => { setActiveCategory(cat.slug); setIsFilterOpen(false); }}
                        className={`flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-bold w-full text-left py-2 border-b border-border/30 transition-colors ${
                          activeCategory === cat.slug ? "text-terracotta border-terracotta/20" : "text-muted hover:text-text"
                        }`}
                      >
                        {activeCategory === cat.slug && <span className="w-2 h-2 bg-terracotta rounded-full" />}
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm results buttons */}
              <div className="px-8 py-6 border-t border-border">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn-primary w-full justify-center py-4"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ShopPage() {
  return (
    <div className="w-full pt-28 md:pt-36 pb-24">
      {/* Search parameters parsing requires an ancestor Suspense boundary wrap to support Next.js SSR build pipeline */}
      <Suspense
        fallback={
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
            <p className="section-label">Loading items…</p>
          </div>
        }
      >
        <ShopContent />
      </Suspense>
    </div>
  );
}

