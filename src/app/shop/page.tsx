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
  category: { name: string; slug: string; };
  sizes: string[];
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || "all";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => { fetchProducts(); }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = activeCategory === "all" ? "/api/products" : `/api/products?category=${activeCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const categories = [
    { name: "All Archive", slug: "all" },
    { name: "Mens", slug: "mens" },
    { name: "Womens", slug: "womens" },
    { name: "Denim", slug: "denim" },
    { name: "Outerwear", slug: "outerwear" },
    { name: "Oversized", slug: "oversized" },
    { name: "Plus Size", slug: "plus-size" },
    { name: "Accessories", slug: "accessories" },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto border-b border-border pb-12 mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-4"
            >
              The Vault
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter leading-[0.85]"
            >
              Archive
            </motion.h1>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted hidden md:block">
              {products.length} pieces curated
            </p>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-3 awwwards-btn-accent px-6 py-4"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex gap-16">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-32 h-max">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-muted border-b border-border pb-4">
            Curations
          </h3>
          <ul className="space-y-5">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-4 group w-full text-left ${activeCategory === cat.slug ? 'text-text' : 'text-muted hover:text-text'}`}
                >
                  <span className={`h-px transition-all duration-500 ${activeCategory === cat.slug ? 'w-8 bg-accent' : 'w-0 bg-muted group-hover:w-4'}`}></span>
                  <span className={activeCategory === cat.slug ? 'text-accent' : ''}>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted">Curating archive...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center space-y-6 bg-card border border-border">
              <p className="text-muted uppercase tracking-widest font-bold text-xs">No pieces found in this archive.</p>
              <button onClick={() => setActiveCategory("all")} className="awwwards-btn">View All Pieces</button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16"
            >
              {products.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group"
                >
                  <Link href={`/shop/product/${product.slug}`} className="block">
                    <div className="relative overflow-hidden aspect-[3/4] mb-6 bg-card border border-border/50">
                      {product.compareAtPrice && (
                        <div className="absolute top-4 left-4 z-10 bg-accent text-bg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-md">
                          Sale
                        </div>
                      )}
                      {(product.sizes?.includes("XXL") || product.sizes?.includes("XXXL")) && (
                        <div className="absolute top-4 right-4 z-10 border border-text text-text bg-bg-dark/80 backdrop-blur-sm px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                          Plus Size
                        </div>
                      )}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-bg-dark/90 backdrop-blur-sm flex justify-between items-center">
                        <span className="text-text text-[10px] font-black uppercase tracking-widest">View details</span>
                        <ArrowRight size={14} className="text-text" />
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <h3 className="text-[11px] font-black uppercase tracking-widest leading-snug line-clamp-2">{product.name}</h3>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-2">{product.brand}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {product.compareAtPrice && (
                          <p className="text-[10px] text-muted line-through mb-1">₹{product.compareAtPrice}</p>
                        )}
                        <p className={`text-xs font-black ${product.compareAtPrice ? 'text-accent' : 'text-text'}`}>₹{product.price}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-dark border-l border-border z-[101] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12 border-b border-border pb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-card">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-card hover:text-accent"><X size={24} /></button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-muted">Categories</h3>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { setActiveCategory(cat.slug); setIsFilterOpen(false); }}
                    className={`block w-full text-left text-sm uppercase tracking-widest font-bold transition-colors py-3 border-b border-border/30 ${activeCategory === cat.slug ? 'text-accent' : 'text-card/70 hover:text-card'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="pt-8 border-t border-border mt-auto">
                <button onClick={() => setIsFilterOpen(false)} className="awwwards-btn-accent w-full text-center">Show Results</button>
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
    <div className="w-full pt-32 pb-24 flex-1">
      <Suspense fallback={<div className="h-[50vh] flex flex-col items-center justify-center gap-4"><Loader2 className="w-8 h-8 animate-spin text-accent" /><p className="text-[10px] uppercase tracking-widest font-bold text-muted">Curating archive...</p></div>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
