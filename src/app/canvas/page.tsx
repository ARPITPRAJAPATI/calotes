"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, X, ShoppingBag, Maximize2, Trash2, ZoomIn, ZoomOut, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { removeBackground, preload } from "@imgly/background-removal";

interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  category: { slug: string; name: string };
  sizes: string[];
  stock?: number;
}

interface CanvasItem extends Product {
  uniqueId: string;
  x: number;
  y: number;
  selectedSize?: string;
  scale: number;
}

function generateCanvasItem(product: Product, isMobile: boolean, transparentUrl?: string): CanvasItem {
  const randomOffset = () => 30 + (Math.random() * 20);
  const desktopOffset = () => 100 + (Math.random() * 50);
  
  return {
    ...product,
    images: transparentUrl ? [transparentUrl, ...product.images.slice(1)] : product.images,
    uniqueId: `${product._id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    x: isMobile ? randomOffset() : desktopOffset(),
    y: isMobile ? randomOffset() : desktopOffset(),
    selectedSize: product.sizes.length > 0 ? product.sizes[0] : "OS",
    scale: 1,
  };
}

export default function FitCanvasPage() {
  const { addToCart, setIsCartOpen, cartCount } = useCart();
  const { toggleWishlist, isInWishlist, count: wishlistCount, setIsOpen: setIsWishlistOpen } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Canvas State
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [cutoutCache, setCutoutCache] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        // Filter out out-of-stock items for the canvas
        setProducts(data.filter(p => p.stock === undefined || p.stock > 0));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Preload the AI model in the background so it's fully downloaded and ready in memory!
    preload({
      model: "isnet_quint8",
      debug: false
    }).catch(e => console.error("AI preloading failed:", e));

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch cached cutouts globally from Server-Side Cutout Cache
  useEffect(() => {
    const fetchGlobalCutouts = async () => {
      try {
        const res = await fetch("/api/cutout");
        if (res.ok) {
          const map = await res.json();
          setCutoutCache(prev => ({ ...prev, ...map }));
        }
      } catch {
        // Silent catch for unused err
      }
    };
    fetchGlobalCutouts();
  }, []);

  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  const handleAddToCanvas = async (product: Product) => {
    if (canvasItems.length >= 5) {
      alert("Maximum 5 items allowed on the canvas!");
      return;
    }

    // 1. Check in-memory cutout cache first for instant 0ms retrieval!
    if (cutoutCache[product._id]) {
      const newItem = generateCanvasItem(product, isMobile, cutoutCache[product._id]);
      setCanvasItems(prev => [...prev, newItem]);
      return;
    }

    setProcessingItemId(product._id);
    try {
      // Create a clean, ultra-fast cutout using client-side AI with 8-bit quantized models!
      const imageBlob = await removeBackground(product.images[0], {
        model: "isnet_quint8",
        debug: false
      });
      const transparentUrl = URL.createObjectURL(imageBlob);

      // 2. Cache the cutout in local state so subsequent adds of this item are 0ms!
      setCutoutCache(prev => ({ ...prev, [product._id]: transparentUrl }));

      // 3. Send to global server-side cache so it is saved globally for all users!
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch("/api/cutout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product._id,
              originalUrl: product.images[0],
              cutoutBase64: base64Data
            })
          });
          const serverData = await res.json();
          if (res.ok && serverData.cutoutUrl) {
            // Update cache to use the persistent Cloudinary URL
            setCutoutCache(prev => ({ ...prev, [product._id]: serverData.cutoutUrl }));
          }
        } catch (e) {
          console.error("Failed to upload cutout to global server-side cache:", e);
        }
      };

      const newItem = generateCanvasItem(product, isMobile, transparentUrl);
      setCanvasItems(prev => [...prev, newItem]);
    } catch (err) {
      console.error("AI Background Removal failed:", err);
      // Fallback to original image if AI fails
      const newItem = generateCanvasItem(product, isMobile);
      setCanvasItems(prev => [...prev, newItem]);
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleRemoveFromCanvas = (uniqueId: string) => {
    setCanvasItems(canvasItems.filter(item => item.uniqueId !== uniqueId));
  };

  const handleSizeChange = (uniqueId: string, size: string) => {
    setCanvasItems(canvasItems.map(item => 
      item.uniqueId === uniqueId ? { ...item, selectedSize: size } : item
    ));
  };

  const handleScaleChange = (uniqueId: string, factor: number) => {
    setCanvasItems(prev => prev.map(item => {
      if (item.uniqueId === uniqueId) {
        const newScale = Math.min(Math.max(item.scale + factor, 0.5), 2.0);
        return { ...item, scale: newScale };
      }
      return item;
    }));
  };

  const handleAddBundleToCart = () => {
    if (canvasItems.length === 0) return;
    
    // Add all items to cart
    canvasItems.forEach(item => {
      addToCart({
        productId: item._id,
        name: item.name,
        price: item.price,
        image: item.images[0],
        size: item.selectedSize || "OS",
        quantity: 1,
      });
    });

    // Clear canvas and open cart
    setCanvasItems([]);
    setIsCartOpen(true);
  };

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category?.slug === activeCategory);

  const bundleTotal = canvasItems.reduce((sum, item) => sum + item.price, 0);
  // Apply a 10% discount if they bundle 3 or more items!
  const isBundleDiscount = canvasItems.length >= 3;
  const finalTotal = isBundleDiscount ? bundleTotal * 0.9 : bundleTotal;

  return (
    <div className="w-full h-screen pt-16 sm:pt-24 pb-0 flex flex-col bg-bg overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 sm:px-12 sm:py-6 border-b border-border bg-bg z-10 flex flex-row gap-3 justify-between items-center shrink-0">
        <div>
          <h1 className="font-display font-black text-lg sm:text-3xl md:text-4xl uppercase tracking-tighter flex items-center">
            Fit Canvas <Sparkles className="text-terracotta ml-1.5" size={14} />
          </h1>
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted mt-1 hidden sm:block">
            Drag, drop, and style your perfect outfit. Bundle 3+ pieces for 10% off.
          </p>
        </div>
        
        {/* Right side options: Studio Close, Cart Drawer, Wishlist Drawer */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative py-1.5 px-2.5 sm:py-2.5 sm:px-4 border border-border text-text hover:text-terracotta hover:border-terracotta transition-colors flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-bg-warm"
          >
            <Heart size={10} className="text-terracotta" fill="currentColor" />
            <span>Wishlist <span className="hidden xs:inline">({wishlistCount})</span></span>
          </button>
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative py-1.5 px-2.5 sm:py-2.5 sm:px-4 border border-border text-text hover:text-terracotta hover:border-terracotta transition-colors flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-bg-warm"
          >
            <ShoppingBag size={10} />
            <span>Bag <span className="hidden xs:inline">({cartCount})</span></span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-bg">
        
        {/* Left (Desktop) / Top (Mobile) Tray: Categories + Wardrobe Inventory */}
        <div className="w-full md:w-80 lg:w-[400px] shrink-0 border-b md:border-b-0 md:border-r border-border bg-bg-warm flex flex-col z-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] md:shadow-[4px_0_24px_rgba(0,0,0,0.05)] h-auto md:h-full">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-border/50 p-2 sm:p-3 md:p-4 gap-1.5 md:gap-2 justify-start shrink-0 bg-bg">
            {["all", "outerwear", "tops", "bottoms", "accessories"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 sm:px-4 sm:py-2 border transition-colors ${
                  activeCategory === cat 
                    ? "bg-text text-bg border-text" 
                    : "border-border text-muted hover:border-text bg-bg-warm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product List in horizontal scrollable format on mobile, and vertical vertical-scroll list on desktop */}
          <div className="flex flex-row md:flex-col gap-2.5 sm:gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar p-2 sm:p-4 justify-start bg-bg-warm flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 w-full"><Loader2 className="animate-spin text-terracotta" /></div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-xs text-muted font-bold text-center py-6 w-full uppercase tracking-widest">No pieces found.</p>
            ) : (
              filteredProducts.map(product => (
                <div 
                  key={product._id} 
                  className="flex gap-2.5 p-1.5 sm:p-2 bg-bg border border-border group hover:border-terracotta transition-all duration-300 w-[62vw] sm:w-[280px] md:w-full shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-12 h-16 sm:w-16 sm:h-20 bg-card shrink-0 border border-border/50 overflow-hidden">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col justify-between flex-1 py-0.5 min-w-0">
                    <div>
                      <h3 className="text-[9px] font-black uppercase tracking-widest truncate md:whitespace-normal md:line-clamp-2 leading-tight">{product.name}</h3>
                      <p className="text-[10px] font-bold text-terracotta mt-1">₹{product.price.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleAddToCanvas(product)}
                        disabled={processingItemId === product._id}
                        className="text-[9px] font-bold uppercase tracking-[0.2em] bg-text text-bg py-1.5 px-3 hover:bg-terracotta hover:text-bg transition-colors flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                      >
                        {processingItemId === product._id ? (
                          <><Loader2 size={8} className="animate-spin" /> Ext...</>
                        ) : (
                          "+ Canvas"
                        )}
                      </button>
                      <button
                        onClick={() => toggleWishlist({
                          productId: product._id,
                          name: product.name,
                          price: product.price,
                          image: product.images[0],
                          slug: product.slug,
                          category: product.category?.name || "Vintage",
                        })}
                        className="p-1.5 border border-border text-muted hover:text-terracotta hover:border-terracotta transition-colors flex shrink-0 items-center justify-center bg-bg"
                        title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart size={10} className={isInWishlist(product._id) ? "fill-current text-terracotta" : ""} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: The Interactive Canvas */}
        <div 
          className="flex-1 relative bg-[#EBEBEB] overflow-hidden" 
          ref={canvasRef}
          style={{ backgroundImage: 'radial-gradient(#d1d1d1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {canvasItems.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted pointer-events-none">
              <Maximize2 size={48} className="mb-4 opacity-20" />
              <p className="font-display font-black text-2xl uppercase tracking-tighter opacity-30">Empty Canvas</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">Add pieces from the wardrobe to style a fit</p>
            </div>
          )}

          {/* Draggable Items */}
          {canvasItems.map((item) => (
            <motion.div
              key={item.uniqueId}
              drag
              dragConstraints={canvasRef}
              dragMomentum={false}
              whileDrag={{ scale: 1.05, cursor: "grabbing", zIndex: 50 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute cursor-grab group drop-shadow-2xl"
              style={{ x: item.x, y: item.y }}
            >
              {/* Item Image (True AI Cutout) */}
              <div 
                className="relative overflow-hidden pointer-events-none drop-shadow-2xl transition-all duration-150"
                style={{ width: `${(isMobile ? 128 : 208) * item.scale}px` }}
              >
                <img 
                  src={item.images[0]} 
                  draggable={false} 
                  className="w-full h-auto object-contain" 
                />
              </div>
              
              {/* Floating Controls Overlay (Shows on Hover) */}
              <div className="absolute -top-4 -right-4 bg-bg border border-border p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-10 pointer-events-auto shadow-xl">
                <button 
                  onClick={() => handleScaleChange(item.uniqueId, 0.1)}
                  className="p-1.5 text-muted hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                  title="Scale Up"
                >
                  <ZoomIn size={12} />
                </button>
                <button 
                  onClick={() => handleScaleChange(item.uniqueId, -0.1)}
                  className="p-1.5 text-muted hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                  title="Scale Down"
                >
                  <ZoomOut size={12} />
                </button>
                <div className="h-[1px] bg-border my-0.5" />
                <button 
                  onClick={() => handleRemoveFromCanvas(item.uniqueId)}
                  className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Size Selector floating below */}
              {item.sizes.length > 0 && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-bg border border-border px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto flex gap-2 shadow-xl w-max">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted border-r border-border pr-2">Size</span>
                  <select 
                    value={item.selectedSize}
                    onChange={(e) => handleSizeChange(item.uniqueId, e.target.value)}
                    className="text-[9px] font-bold uppercase tracking-widest bg-transparent focus:outline-none cursor-pointer pl-1 text-terracotta"
                  >
                    {item.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Checkout Bar */}
      <div className="px-6 md:px-12 py-5 border-t border-border bg-bg-warm shrink-0 flex justify-between items-center relative z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Canvas Value</p>
          <div className="flex items-end gap-3 mt-1">
            <span className="text-2xl font-black text-text">
              ₹{finalTotal.toLocaleString("en-IN")}
            </span>
            {isBundleDiscount && (
              <span className="text-sm font-bold text-terracotta line-through mb-1">
                ₹{bundleTotal.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {isBundleDiscount && <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">10% Bundle Discount Applied!</span>}
        </div>

        <button 
          onClick={handleAddBundleToCart}
          disabled={canvasItems.length === 0}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-colors ${
            canvasItems.length > 0 
              ? "bg-terracotta text-bg hover:bg-text" 
              : "bg-border text-muted cursor-not-allowed"
          }`}
        >
          <ShoppingBag size={14} />
          {canvasItems.length > 0 ? `Add Fit To Bag (${canvasItems.length})` : "Canvas Empty"}
        </button>
      </div>
    </div>
  );
}
