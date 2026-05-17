"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Ruler, Loader2, MessageCircle, Star, Sparkles, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";

const MOCK_RELATED = [
  { slug: "vintage-levis-501", name: "Vintage Levi's 501", price: 3499, img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=800" },
  { slug: "carhartt-jacket", name: "Carhartt Detroit Jacket", price: 7999, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800" },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?slug=${params.slug}`);
        const data = await res.json();
        
        if (res.ok && Array.isArray(data)) {
          const found = data.find((p: any) => p.slug === params.slug);
          setProduct(found || null);
          
          // Fetch related products
          if (found && found.category?.slug) {
            const relRes = await fetch(`/api/products?category=${found.category.slug}`);
            const relData = await relRes.json();
            if (relRes.ok && Array.isArray(relData)) {
              setRelatedProducts(relData.filter((p: any) => p._id !== found._id).slice(0, 4));
            } else {
              setRelatedProducts([]);
            }
          }
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error(e);
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      alert("Select a size first.");
      return;
    }
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize || "OS",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsCartOpen(true);
    }, 1000);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = `Hi Calotes, I'm interested in the ${product.name} (₹${product.price}). Is it available?`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      <p className="section-label">Accessing Items…</p>
    </div>
  );
  if (!product) return (
    <div className="h-screen bg-bg flex flex-col items-center justify-center gap-6">
      <p className="text-muted uppercase tracking-widest font-bold text-xs">This piece is no longer in the items list.</p>
      <Link href="/shop" className="awwwards-btn">Return to Shop</Link>
    </div>
  );

  return (
    <div className="w-full pt-28 pb-24 flex-1">
      {/* Breadcrumb Navigation */}
      <div className="px-6 md:px-12 border-b border-border/40 py-8 mb-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <Link href="/shop" className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted hover:text-text transition-all duration-300">
            <div className="w-8 h-px bg-muted group-hover:w-12 group-hover:bg-text transition-all duration-500" />
            <span>Back to Items</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted/40">
            <span>Items</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-muted">{product.category.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-12">

          {/* Left: Interactive Image Slider (Slightly smaller, 5/12 grid layout) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-[3/4] bg-bg-warm overflow-hidden border border-border/30 group">
              {/* Image / Video render */}
              {product.images[selectedImage].endsWith(".mp4") ? (
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src={product.images[selectedImage]} type="video/mp4" />
                </video>
              ) : (
                <img 
                  src={product.images[selectedImage]} 
                  alt={`${product.name} - View ${selectedImage + 1}`} 
                  className="w-full h-full object-cover transition-all duration-700" 
                />
              )}

              {/* Slider Arrows (visible if more than 1 image) */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-bg/90 border border-border hover:bg-text hover:text-bg transition-colors duration-300 z-10 flex items-center justify-center cursor-pointer shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-bg/90 border border-border hover:bg-text hover:text-bg transition-colors duration-300 z-10 flex items-center justify-center cursor-pointer shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Slider Thumbnail Dots Indicator */}
            {product.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-1 transition-all duration-300 ${
                      selectedImage === idx ? "w-8 bg-text" : "w-2 bg-border hover:bg-muted"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnails list below main slider */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-18 shrink-0 border bg-bg-warm transition-all duration-300 ${
                      selectedImage === idx ? "border-text" : "border-border/50 hover:border-muted"
                    }`}
                  >
                    {img.endsWith(".mp4") ? (
                      <div className="w-full h-full bg-card flex items-center justify-center text-[7px] font-black uppercase">Video</div>
                    ) : (
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info (Sticky, 7/12 grid layout) */}
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
                {product.compareAtPrice && (
                  <span className="text-muted line-through text-lg mb-1">₹{product.compareAtPrice.toLocaleString("en-IN")}</span>
                )}
              </div>

              {/* Dynamic Rarity/Stock Badge */}
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

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select Size</p>
                  <button className="text-[9px] font-bold uppercase tracking-widest text-muted underline-hover">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
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

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {product.stock !== undefined && product.stock <= 0 ? (
                <div className="space-y-4">
                  <button
                    disabled
                    className="w-full py-5 bg-muted/20 border border-border text-muted text-[10px] font-black uppercase tracking-[0.3em] cursor-not-allowed"
                  >
                    SOLD OUT / CURATED
                  </button>
                  <p className="text-[9px] font-bold text-center text-muted uppercase tracking-widest leading-relaxed">
                    This unique archive piece has found a home. <br />
                    Stay tuned for our next seasonal curation!
                  </p>
                </div>
              ) : (
                <>
                  {/* Add to Bag and Wishlist actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="btn-primary flex-1 py-5 flex items-center justify-center"
                    >
                      {added ? "✓ Added to Bag" : "Add to Bag"}
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
                      className="p-5 border border-border bg-bg-warm text-text hover:text-terracotta hover:border-terracotta transition-colors flex items-center justify-center shrink-0"
                      title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={16} className={isInWishlist(product._id) ? "fill-current text-terracotta" : ""} />
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

            {/* Description & Details Accordion-style layout */}
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

        {/* Reviews Section */}
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
                <p className="text-[11px] text-muted leading-relaxed mb-5">"{rev.text}"</p>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted border-t border-border pt-3">
                  <span>{rev.name} <span className="text-terracotta ml-2">✓ Verified</span></span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-10 mb-6">
            <h2 className="font-display font-black text-4xl uppercase tracking-tighter mb-6 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((item, idx) => (
                <Link href={`/shop/product/${item.slug}`} key={idx} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-card mb-4 border border-border/50 relative">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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
