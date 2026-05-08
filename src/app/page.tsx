"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";

const MENS_PRODUCTS = [
  { id: 1, name: "Vintage Levi's 501", price: "₹3,499", tag: "Denim", img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Carhartt Detroit Jacket", price: "₹7,999", tag: "Outerwear", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Harley Davidson Tee", price: "₹2,499", tag: "Tees", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "Military Field Jacket", price: "₹6,499", tag: "Outerwear", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop" },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="w-full flex flex-col pt-24 md:pt-32">
      
      {/* 1. HERO SECTION */}
      <section className="px-6 md:px-12 max-w-[1800px] mx-auto w-full mb-24 md:mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-start z-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-[7.5vw] uppercase tracking-tighter leading-[0.8] mb-12">
                <span className="block overflow-hidden">
                  <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }} className="block">Adapt.</motion.span>
                </span>
                <span className="block overflow-hidden font-serif italic font-light lowercase tracking-normal text-[0.9em] -mt-2 mb-2">
                  <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1, ease: [0.19, 1, 0.22, 1] }} className="block">Stand Out.</motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }} className="block">Be Calotes.</motion.span>
                </span>
              </h1>
              <p className="text-muted text-xs md:text-sm max-w-xs mb-12 font-medium uppercase tracking-[0.2em] leading-relaxed opacity-80">
                Premium pre-owned vintage and streetwear. Hand-picked for the modern icon.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="awwwards-btn-accent">
                  Shop The Archive
                </Link>
                <Link href="/shop/denim" className="awwwards-btn text-muted hover:text-bg">
                  Vintage Denim
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-7 h-[65vh] lg:h-[85vh] relative order-1 lg:order-2 overflow-hidden bg-bg-dark rounded-sm border border-border">
            <motion.img 
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop" 
              alt="Vintage Fashion Model" 
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* 2. MARQUEE BANNER */}
      <div className="py-6 bg-accent overflow-hidden border-y border-border">
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="flex whitespace-nowrap items-center">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-bg font-display font-black text-2xl md:text-4xl uppercase tracking-widest mx-8 flex items-center gap-8">
              Premium Vintage <Star size={16} fill="currentColor" /> Authentic Archive <Star size={16} fill="currentColor" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* 3. NEW DROPS SECTION */}
      <section className="py-24 md:py-40 px-6 md:px-12 max-w-[1800px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-24 relative">
          <div className="absolute -left-12 top-0 text-[100px] font-display font-black text-border leading-none select-none hidden xl:block">01</div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted mb-4">Fresh Additions</p>
            <h2 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tighter leading-none">New Drops</h2>
          </div>
          <Link href="/shop" className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:opacity-50 transition-opacity group">
            View Archive <div className="w-10 h-px bg-text group-hover:w-16 transition-all duration-500" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {MENS_PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <Link href="/shop">
                <div className="relative aspect-[3/4] premium-card mb-4">
                  <span className="absolute top-4 left-4 z-10 text-[8px] font-black uppercase tracking-[0.2em] bg-text text-bg px-3 py-1.5 rounded-none shadow-sm">
                    {product.tag}
                  </span>
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-bg/95 backdrop-blur-sm flex justify-between items-center border-t border-border">
                    <span className="text-text text-[9px] font-black uppercase tracking-widest">Quick View</span>
                    <ArrowRight size={14} className="text-text" />
                  </div>
                </div>
                <div className="flex justify-between items-start mt-6">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest leading-snug mb-1">{product.name}</h3>
                    <p className="text-[9px] text-muted font-bold uppercase tracking-[0.2em]">{product.tag}</p>
                  </div>
                  <p className="text-[10px] font-black">{product.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. SHOP BY CATEGORY */}
      <section className="py-24 bg-card border-y border-border px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto relative">
          <div className="absolute -right-12 top-0 text-[100px] font-display font-black text-border leading-none select-none hidden xl:block">02</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter text-center mb-24">Curated Categories</h2>
          
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-8 snap-x no-scrollbar px-6 md:px-12">
          {[
            { title: "Jerseys", img: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800", link: "/shop/mens" },
            { title: "Gym Core", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800", link: "/shop/womens" },
            { title: "Hoodies", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800", link: "/shop/denim" },
            { title: "Outerwear", img: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=800", link: "/shop/outerwear" },
            { title: "Oversized", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800", link: "/shop/plus-size" },
            { title: "Accessories", img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800", link: "/shop/accessories" }
          ].map((cat, i) => (
            <Link key={i} href={cat.link} className="relative min-w-[140px] md:min-w-[200px] aspect-square group rounded-[1.5rem] overflow-hidden snap-start flex-shrink-0">
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end items-center text-center">
                <h3 className="font-display font-black text-[10px] md:text-xs text-white uppercase tracking-[0.2em]">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/shop" className="awwwards-btn px-12 py-4">
            See All
          </Link>
        </div>
      </div>
    </section>

      {/* 5. WHY CALOTES (STORYTELLING) */}
      <section className="py-32 md:py-48 px-6 md:px-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/5] md:aspect-square relative p-4 md:p-12 premium-card bg-bg-dark"
          >
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000" alt="Vintage Philosophy" className="w-full h-full object-cover transition-transform duration-[1.5s]" />
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white border border-border hidden md:flex flex-col items-center justify-center p-6 text-center shadow-xl">
              <p className="font-display font-black text-3xl uppercase tracking-tighter leading-none text-text">100%</p>
              <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase mt-2">Authentic</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col gap-12"
          >
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted">The Philosophy</p>
              <h2 className="font-display font-black text-5xl md:text-8xl uppercase tracking-tighter leading-[0.8]">
                Authentic.<br/>Curated.<br/>Timeless.
              </h2>
            </div>
            <div className="space-y-8 text-[11px] text-muted font-medium leading-[1.8] max-w-sm uppercase tracking-widest">
              <p>
                We believe that true style isn't manufactured—it's discovered. Our archive is curated for those who appreciate the patina of time and the bold statement of pre-owned fashion.
              </p>
              <p className="font-serif italic lowercase font-light text-xl text-text tracking-normal normal-case">
                "Every garment has a story, and we are here to help you continue it."
              </p>
            </div>
            <Link href="/about" className="awwwards-btn self-start">
              Our Vision
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 6. INSTAGRAM / LOOKBOOK TEASER */}
      <section className="py-24 bg-bg-dark text-text border-t border-border overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-12 flex justify-between items-end">
          <div>
            <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter mb-2">On The Streets</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">@calotes.vintage</p>
          </div>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">
            Follow Us <ArrowRight size={14} />
          </a>
        </div>

        <div className="flex gap-4 px-6 md:px-12 overflow-x-auto hide-scrollbar pb-8">
          {[
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
            "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?q=80&w=600",
            "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600",
            "https://images.unsplash.com/photo-1434389670869-c87520f92276?q=80&w=600",
            "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600"
          ].map((img, i) => (
            <a key={i} href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="relative shrink-0 w-64 md:w-80 aspect-square group overflow-hidden bg-card border border-border">
              <img src={img} alt="Instagram Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest border border-white px-4 py-2">View Post</span>
              </div>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}
