"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Ruler, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  brand: string;
  condition: string;
  sizes: string[];
  measurements?: { pitToPit?: string; length?: string; waist?: string; };
  category: { name: string; slug: string; };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?slug=${params.slug}`);
        const data = await res.json();
        const found = data.find((p: any) => p.slug === params.slug);
        setProduct(found);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
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
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return (
    <div className="h-screen bg-bg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted" />
    </div>
  );
  if (!product) return (
    <div className="h-screen bg-bg flex flex-col items-center justify-center gap-4">
      <p className="text-muted uppercase tracking-widest font-bold text-xs">Product not found.</p>
      <Link href="/shop" className="awwwards-btn">Back to Archive</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Sticky Breadcrumb */}
      <div className="pt-28 pb-4 px-6 md:px-12 border-b border-border sticky top-0 bg-bg/90 backdrop-blur-sm z-40">
        <Link href="/shop" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-text transition-colors">
          <ArrowLeft size={12} /> Back to Archive
        </Link>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-[3/4] overflow-hidden bg-card relative"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-[3/4] overflow-hidden transition-all ${selectedImage === idx ? 'ring-1 ring-text' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 lg:h-max space-y-10">
            {/* Brand & Category */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-3">
                {product.brand} — {product.category.name}
              </p>
              <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter leading-[0.9] mb-6">
                {product.name}
              </h1>
              {/* Price */}
              <div className="flex items-baseline gap-4">
                {product.compareAtPrice && (
                  <span className="text-muted line-through text-lg">₹{product.compareAtPrice}</span>
                )}
                <span className={`text-2xl font-black ${product.compareAtPrice ? 'text-accent-pink' : ''}`}>
                  ₹{product.price}
                </span>
              </div>
            </div>

            {/* Condition Badge */}
            <div className="flex items-center gap-3 border-y border-border py-4">
              <ShieldCheck size={16} className="text-muted" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Condition: </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-pink">{product.condition}</span>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-text text-bg border-text'
                          : 'bg-transparent border-border hover:border-text'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full py-6 bg-text text-bg text-[10px] font-black uppercase tracking-[0.3em] hover:bg-bg-dark transition-colors duration-300"
            >
              {added ? "✓ Added to Collection" : "Add to Collection"}
            </button>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Description</p>
              <p className="text-sm text-muted leading-relaxed">{product.description}</p>
            </div>

            {/* Measurements */}
            {product.measurements && (
              <div className="space-y-3 border-t border-border pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2"><Ruler size={12} /> Measurements</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest">
                  {product.measurements.pitToPit && <div className="flex justify-between border-b border-border py-2"><span className="text-muted">Pit to Pit</span><span>{product.measurements.pitToPit}</span></div>}
                  {product.measurements.length && <div className="flex justify-between border-b border-border py-2"><span className="text-muted">Length</span><span>{product.measurements.length}</span></div>}
                  {product.measurements.waist && <div className="flex justify-between border-b border-border py-2"><span className="text-muted">Waist</span><span>{product.measurements.waist}</span></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
