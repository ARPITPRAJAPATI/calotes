"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  brand: string;
  category: { name: string; slug: string; };
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

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
    { name: "Outerwear", slug: "outerwear" },
    { name: "Accessories", slug: "accessories" },
  ];

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Page Header */}
      <div className="pt-40 pb-16 px-6 md:px-12 border-b border-border">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted mb-4">Calotes — The Archive</p>
            <h1 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.85]">
              Browse <br/>
              <span className="italic font-serif font-normal text-muted tracking-normal">the</span> Collection
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="awwwards-btn flex items-center gap-2"
            >
               Back
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted hidden md:block">{products.length} pieces</p>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 awwwards-btn"
            >
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex gap-16 mt-16 pb-32">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0 sticky top-32 h-max">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-muted">Categories</h3>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`text-sm uppercase tracking-widest font-bold transition-all flex items-center gap-3 group ${activeCategory === cat.slug ? 'text-text' : 'text-muted hover:text-text'}`}
                >
                  <span className={`h-px transition-all duration-500 ${activeCategory === cat.slug ? 'w-6 bg-text' : 'w-0 bg-muted group-hover:w-4'}`}></span>
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted" />
            </div>
          ) : products.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
              <p className="text-muted uppercase tracking-widest font-bold text-xs">This section is being curated.</p>
              <button onClick={() => setActiveCategory("all")} className="awwwards-btn mt-4">Clear Filters</button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-20"
            >
              {products.map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group"
                >
                  <Link href={`/shop/product/${product.slug}`} className="block">
                    <div className="relative overflow-hidden aspect-[3/4] mb-6 bg-card">
                      {product.compareAtPrice && (
                        <div className="absolute top-4 left-4 z-10 bg-accent text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                          Sale
                        </div>
                      )}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider leading-tight">{product.name}</h3>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{product.brand}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {product.compareAtPrice && (
                          <p className="text-[10px] text-muted line-through">₹{product.compareAtPrice}</p>
                        )}
                        <p className={`text-xs font-bold ${product.compareAtPrice ? 'text-accent' : 'text-text'}`}>₹{product.price}</p>
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
              onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-black/40 z-[100]" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-bg z-[101] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12 border-b border-border pb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Filter</h2>
                <button onClick={() => setIsFilterOpen(false)}><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { setActiveCategory(cat.slug); setIsFilterOpen(false); }}
                    className={`block w-full text-left text-sm uppercase tracking-widest font-bold transition-colors py-2 ${activeCategory === cat.slug ? 'text-text' : 'text-muted hover:text-text'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsFilterOpen(false)} className="awwwards-btn mt-auto">Apply</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
