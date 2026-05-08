"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  brand: string;
  category: { name: string; slug: string };
  sizes: string[];
  condition?: string;
}

const CATEGORIES = [
  { name: "All Items", slug: "all" },
  { name: "Denim",       slug: "denim" },
  { name: "Outerwear",   slug: "outerwear" },
  { name: "Oversized",   slug: "oversized" },
  { name: "Plus Size",   slug: "plus-size" },
  { name: "Accessories", slug: "accessories" },
];

function ShopContent() {
  const searchParams   = useSearchParams();
  const initialCat     = searchParams.get("category") || "all";

  const [products,      setProducts]      = useState<Product[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [isFilterOpen,  setIsFilterOpen]  = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCat);

  useEffect(() => { fetchProducts(); }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = activeCategory === "all"
        ? "/api/products"
        : `/api/products?category=${activeCategory}`;
      const res  = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  return (
    <>
      {/* ── Page header ─────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-10">
        <div className="border-b border-border pb-10 mb-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="section-label mb-3"
          >
            The Vault
          </motion.p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="font-display font-bold text-6xl md:text-8xl lg:text-[9vw] uppercase tracking-tight leading-[0.82] text-text"
            >
              Items
            </motion.h1>
            <div className="flex items-center gap-5">
              <p className="section-label hidden md:block">{products.length} pieces</p>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 btn-primary px-6 py-3"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* ── Category tabs ────────────────────────── */}
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

      {/* ── Main layout: sidebar + grid ─────────────── */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex gap-10 lg:gap-14">

        {/* Desktop sidebar */}
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
                  <span className={`h-px transition-all duration-700 ${
                    activeCategory === cat.slug ? "w-8 bg-terracotta" : "w-0 group-hover:w-3 bg-muted"
                  }`} />
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product grid */}
        <div className="flex-1 pb-24">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
              <p className="section-label">Curating items…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-6 border border-border">
              <p className="section-label">No pieces in this category.</p>
              <button onClick={() => setActiveCategory("all")} className="btn-outline">
                View All
              </button>
            </div>
          ) : (
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
                  transition={{ delay: idx * 0.05, ease: [0.16,1,0.3,1] }}
                  className="product-card group"
                >
                  <Link href={`/shop/product/${product.slug}`}>
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-bg-warm">
                      {product.compareAtPrice && (
                        <span className="absolute top-2 left-2 z-10 text-[7px] font-bold uppercase tracking-widest bg-terracotta/90 text-bg px-2 py-0.5">
                          Sale
                        </span>
                      )}
                      <span className="absolute top-2 right-2 z-10 text-[7px] font-bold uppercase tracking-widest bg-bg/80 text-muted px-2 py-0.5">
                        {product.condition || "Pre-Loved"}
                      </span>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="product-card-img w-full h-full object-cover"
                      />
                    </div>
                    {/* Info */}
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

      {/* ── Mobile floating filter btn ───────────────── */}
      <div className="fixed bottom-8 right-5 z-40 lg:hidden">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-12 h-12 bg-terracotta text-bg rounded-full shadow-2xl flex items-center justify-center"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* ── Filter drawer ────────────────────────────── */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-[100]"
              onClick={() => setIsFilterOpen(false)}
            />
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
