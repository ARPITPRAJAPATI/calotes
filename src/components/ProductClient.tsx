"use client";

import SafeImage from "@/components/SafeImage";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Ruler, MessageCircle, Star, Sparkles, Heart, ChevronLeft, ChevronRight, ScanLine, Maximize2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import PatinaInspector from "@/components/PatinaInspector";
import FullScreenImageViewer from "@/components/FullScreenImageViewer";
import toast from "react-hot-toast";

interface ProductClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  // Touch swipe support for mobile gallery
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Image
      setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Image
      setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!product) {
    return (
      <div className="h-screen bg-bg flex flex-col items-center justify-center gap-6">
        <p className="text-muted uppercase tracking-widest font-bold text-xs">This piece is no longer in the items list.</p>
        <Link href="/shop" className="btn-primary">Return to Shop</Link>
      </div>
    );
  }

  const categoryName = typeof product.category === "object" ? product.category?.name : product.category || "Vintage";

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    addToCart({
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/images/hero-pc.jpg',
      size: selectedSize || "OS",
      quantity: 1,
      stock: product.stock !== undefined ? product.stock : 1,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsCartOpen(true);
    }, 1000);
  };

  const handleWhatsApp = () => {
    const msg = `Hi Calotes, I'm interested in the ${product.name} (₹${product.price}). Is it available?`;
    window.open(`https://api.whatsapp.com/send?phone=919953861654&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="w-full pt-28 pb-24 flex-1">
      {/* Patina Inspector Modal */}
      <AnimatePresence>
        {inspectorOpen && (
          <PatinaInspector
            images={product.images}
            productName={product.name}
            brand={product.brand}
            condition={product.condition}
            category={categoryName}
            onClose={() => setInspectorOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Full-Screen Edge-to-Edge Slidable & Zoomable Lightbox Modal */}
      <AnimatePresence>
        {isFullScreenOpen && (
          <FullScreenImageViewer
            images={product.images}
            initialIndex={selectedImage}
            productName={product.name}
            onClose={() => setIsFullScreenOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="px-6 md:px-12 border-b border-border/40 py-8 mb-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <Link href="/shop" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted hover:text-text transition-all duration-300">
            <div className="w-8 h-px bg-muted group-hover:w-12 group-hover:bg-text transition-all duration-500" />
            <span>Back to Items</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted/40">
            <span>Items</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-muted">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-12">
          {/* Left Column: Image Gallery (Flipkart Style Slidable + Tap to Fullscreen) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsFullScreenOpen(true)}
              className="relative aspect-[3/4] bg-bg-warm overflow-hidden border border-border/30 group cursor-zoom-in"
              title="Click or tap to open fullscreen zoom view"
            >
              {product.images[selectedImage]?.endsWith(".mp4") ? (
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src={product.images[selectedImage]} type="video/mp4" />
                </video>
              ) : (
                <img 
                  src={product.images[selectedImage]} 
                  alt={`${product.name} - View ${selectedImage + 1}`} 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02]" 
                />
              )}

              {/* Tap to Fullscreen Badge */}
              <div className="absolute top-4 right-4 bg-bg/85 backdrop-blur-md border border-border/60 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-text z-10 transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:border-terracotta shadow-md">
                <Maximize2 size={12} className="text-terracotta" />
                <span className="text-[8px] font-black uppercase tracking-widest">Tap to Zoom</span>
              </div>

              {/* Chevron Navigation (Discreet on desktop, clean on mobile) */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg/80 backdrop-blur-sm border border-border/50 text-text hover:bg-text hover:text-bg transition-all duration-200 z-10 flex items-center justify-center cursor-pointer shadow-md opacity-80 hover:opacity-100 active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg/80 backdrop-blur-sm border border-border/50 text-text hover:bg-text hover:text-bg transition-all duration-200 z-10 flex items-center justify-center cursor-pointer shadow-md opacity-80 hover:opacity-100 active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Bottom Pagination Dots (Flipkart Style — Tiny & Clean) */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-bg/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/30 shadow-sm pointer-events-auto">
                  {product.images.map((_: any, idx: number) => (
                    <span
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(idx);
                      }}
                      className={`block rounded-full cursor-pointer transition-all duration-300 ${
                        idx === selectedImage
                          ? "w-4 h-1.5 bg-terracotta"
                          : "w-1.5 h-1.5 bg-muted/40 hover:bg-muted/70"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Preview Strip */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-20 bg-bg-warm rounded overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer ${
                      idx === selectedImage
                        ? "border-terracotta scale-105 shadow-md"
                        : "border-border/40 opacity-70 hover:opacity-100 hover:border-border"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Google Lens Reverse Image Authentication Button */}
            <button
              type="button"
              onClick={() => {
                const targetImage = product.images?.[selectedImage] || product.images?.[0];
                if (!targetImage) {
                  toast.error("No product image found for authentication");
                  return;
                }
                const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(targetImage)}`;
                window.open(lensUrl, "_blank", "noopener,noreferrer");
              }}
              className="group flex items-center justify-between w-full border border-border hover:border-terracotta bg-bg-warm hover:bg-terracotta/5 px-5 py-4 transition-all duration-300 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta group-hover:bg-terracotta group-hover:text-bg transition-colors shrink-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-text group-hover:text-terracotta transition-colors flex items-center gap-1.5">
                    Authenticate on Google Lens
                    <span className="text-[7px] font-bold px-1.5 py-0.5 bg-terracotta/15 text-terracotta rounded uppercase tracking-wider">
                      Verify
                    </span>
                  </p>
                  <p className="text-[7px] font-bold uppercase tracking-widest text-muted mt-0.5">
                    Reverse Image Search · Match Vintage Catalog · Real vs Fake
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted group-hover:text-terracotta transition-colors">
                <span className="text-[8px] font-bold uppercase tracking-widest hidden sm:inline-block">Open Lens</span>
                <div className="w-6 h-px bg-border group-hover:w-10 group-hover:bg-terracotta transition-all duration-500" />
              </div>
            </button>
          </div>

          {/* Right Column: Product Panel */}
          <div className="lg:col-span-7 lg:sticky lg:top-32 lg:h-max space-y-10 py-8">
            <div>
              <p className="section-label mb-4 flex items-center gap-2">
                <Sparkles size={10} /> Pre-Loved · Authenticated
              </p>
              <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter leading-[0.9] mb-4">
                {product.name}
              </h1>
              <p className="section-label mb-8">{product.brand}</p>
              
              <div className="flex items-end gap-4">
                <span className="text-3xl font-black text-terracotta">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-6">
                {product.stock !== undefined && product.stock > 0 ? (
                  product.stock === 1 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-600">
                      ⚠️ ONLY 1 UNIQUE PIECE AVAILABLE IN THE VAULT!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-600">
                      🔥 ONLY {product.stock} PIECES REMAINING!
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-600">
                    ❌ SOLD OUT / CURATED
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 border-y border-border py-5 bg-bg-warm px-4">
              <ShieldCheck size={16} className="text-terracotta" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text">Condition: {product.condition}</span>
                <span className="section-label mt-1">Professionally authenticated and cleaned.</span>
              </div>
            </div>

            {product.sizes?.length > 0 && (
              <div>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select Size</p>
                  <button className="text-[9px] font-bold uppercase tracking-widest text-muted underline-hover">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => {
                    const isPlus = size === "XXL" || size === "XXXL" || size === "4XL";
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`relative px-5 py-3 text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                          selectedSize === size
                            ? 'bg-terracotta text-bg border-terracotta'
                            : isPlus 
                              ? 'bg-accent/10 border-accent/30 text-text hover:border-accent' 
                              : 'bg-transparent border-border hover:border-border-warm'
                        }`}
                      >
                        {size}
                        {isPlus && <span className="absolute -top-2 -right-2 bg-accent text-bg text-[7px] px-1 py-0.5">PLUS</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {product.stock !== undefined && product.stock <= 0 ? (
                <div className="space-y-4">
                  <button
                    disabled
                    className="w-full py-5 bg-muted/20 border border-border text-muted text-[10px] font-black uppercase tracking-[0.3em] cursor-not-allowed"
                  >
                    SOLD OUT / CURATED
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="btn-primary flex-1 py-5 flex items-center justify-center"
                    >
                      {added ? "✓ Added to Bag" : "Add to Bag"}
                    </button>
                    <button
                      onClick={() => toggleWishlist({
                        productId: product._id.toString(),
                        name: product.name,
                        price: product.price,
                        image: product.images[0],
                        slug: product.slug,
                        category: categoryName,
                      })}
                      className="p-5 border border-border bg-bg-warm text-text hover:text-terracotta hover:border-terracotta transition-colors flex items-center justify-center shrink-0"
                      title={isInWishlist(product._id.toString()) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={16} className={isInWishlist(product._id.toString()) ? "fill-current text-terracotta" : ""} />
                    </button>
                  </div>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-5 bg-transparent border border-[#25D366]/60 text-[#25D366] text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-[#25D366] hover:text-white transition-colors duration-300 flex items-center justify-center gap-3"
                  >
                    <MessageCircle size={14} /> Buy on WhatsApp
                  </button>
                </>
              )}
            </div>

            <div className="space-y-8 pt-8 border-t border-border">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">The Story</p>
                <p className="text-sm text-muted leading-relaxed font-medium">{product.description}</p>
              </div>

              {product.measurements && (
                <div className="space-y-4 bg-bg-warm p-6 border border-border">
                  <p className="section-label flex items-center gap-2"><Ruler size={12} /> Measurements</p>
                  <div className="grid grid-cols-1 gap-0 text-[9px] font-bold uppercase tracking-widest text-muted">
                    {product.measurements.pitToPit && <div className="flex justify-between border-b border-border py-2.5"><span>Pit to Pit</span><span className="text-text">{product.measurements.pitToPit}</span></div>}
                    {product.measurements.length && <div className="flex justify-between border-b border-border py-2.5"><span>Length</span><span className="text-text">{product.measurements.length}</span></div>}
                    {product.measurements.waist && <div className="flex justify-between border-b border-border py-2.5"><span>Waist</span><span className="text-text">{product.measurements.waist}</span></div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-border pt-10 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
              <h2 className="font-display font-black text-4xl uppercase tracking-tighter mb-4">Community Reviews</h2>
              <div className="flex items-center gap-1.5 text-terracotta">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                <span className="text-text text-[9px] font-bold ml-2 uppercase tracking-widest">4.9 / 5.0 · 24 Reviews</span>
              </div>
            </div>
            <button className="btn-outline">Write a Review</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Rahul S.", text: "Incredible piece. Exactly as described and shipping was super fast.", date: "2 days ago" },
              { name: "Karan M.", text: "The condition is actually better than I expected for a vintage item. Will buy again.", date: "1 week ago" },
              { name: "Priya T.", text: "Finally found my holy grail jacket here. Amazing curation.", date: "2 weeks ago" },
            ].map((rev, i) => (
              <div key={i} className="bg-bg-warm p-6 border border-border">
                <div className="flex text-terracotta mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} size={11} fill="currentColor" />)}
                </div>
                <p className="text-[11px] text-muted leading-relaxed mb-5">{"\""}{rev.text}{"\""}</p>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted border-t border-border pt-3">
                  <span>{rev.name} <span className="text-terracotta ml-2">✓ Verified</span></span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-10 mb-6">
            <h2 className="font-display font-black text-4xl uppercase tracking-tighter mb-6 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((item, idx) => (
                <Link href={`/shop/product/${item.slug}`} key={idx} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-card mb-4 border border-border/50 relative">
                    <SafeImage src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-bg-dark/90 text-center">
                       <span className="text-text text-[10px] font-black uppercase tracking-widest">View details</span>
                    </div>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-1 truncate">{item.name}</h3>
                  <p className="text-[10px] font-bold text-muted">₹{item.price.toLocaleString("en-IN")}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
