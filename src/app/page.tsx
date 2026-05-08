"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useRef } from "react";

/* ─────────────────────────────────────────────────────────
   Latest Arrivals (horizontal scroll – Aged Arc style)
───────────────────────────────────────────────────────── */
const ARRIVALS = [
  { name: "Vintage Levi's 501",       price: "₹3,499", tag: "Denim",     img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800" },
  { name: "Carhartt Detroit Jacket",  price: "₹7,999", tag: "Outerwear", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800" },
  { name: "Harley Davidson Tee",      price: "₹2,499", tag: "Tees",      img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800" },
  { name: "Military Field Jacket",    price: "₹6,499", tag: "Outerwear", img: "https://images.unsplash.com/photo-1434389670869-c87520f92276?q=80&w=800" },
  { name: "Vintage Nike Hoodie",      price: "₹4,299", tag: "Hoodies",   img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800" },
  { name: "90s Striped Rugby",        price: "₹1,999", tag: "Jerseys",   img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800" },
];

const CATEGORIES = [
  { title: "Denim",       img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=900", href: "/shop?category=denim" },
  { title: "Outerwear",   img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=900",   href: "/shop?category=outerwear" },
  { title: "Oversized",   img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900",   href: "/shop?category=oversized" },
  { title: "Plus Size",   img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900", href: "/shop?category=plus-size" },
];

const INSTA_IMGS = [
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600",
  "https://images.unsplash.com/photo-1529139572765-798728d32ec4?q=80&w=600",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600",
];

/* ─────────────────────────────────────────────────────────
   Page Component
───────────────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="w-full flex flex-col">
      {/* ══════════════════════════════════════════════════
          1 · HERO
      ══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-[100svh] min-h-[600px] overflow-hidden flex flex-col">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1600&auto=format&fit=crop"
            alt="Calotes Vintage Hero"
            className="w-full h-full object-cover object-top"
          />
          {/* Warm dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/40 to-bg/80" />
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center h-full px-6 md:px-12 max-w-[1800px] w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Eye-brow */}
            <p className="section-label mb-6">Premium Pre-Owned · Est. India</p>

            {/* Main heading */}
            <h1 className="font-display font-bold text-[13vw] md:text-[10vw] lg:text-[8vw] uppercase tracking-tight leading-[0.82] text-text mb-8 md:mb-12">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.19,1,0.22,1] }}
                >
                  Adapt.
                </motion.span>
              </span>
              <span className="block overflow-hidden font-serif italic font-light lowercase tracking-normal text-[0.88em] -mt-1">
                <motion.span
                  className="block text-terracotta"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.19,1,0.22,1] }}
                >
                  Stand Out.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.19,1,0.22,1] }}
                >
                  Be Calotes.
                </motion.span>
              </span>
            </h1>

            {/* Sub-text + CTA row */}
            <div className="flex flex-col items-center gap-8">
              <p className="text-muted text-[11px] font-medium uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                Hand-picked vintage & streetwear.<br />
                For the Indian modern icon.
              </p>
              <Link href="/shop" className="btn-outline px-12 py-5 text-sm tracking-[0.3em]">
                Shop
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 right-8 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-text/40" />
          <span className="section-label writing-mode-vertical rotate-90 text-text/30">Scroll</span>
        </motion.div>
      </section>



      {/* ══════════════════════════════════════════════════
          3 · LATEST ARRIVALS (Aged Arc horizontal scroll)
      ══════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20 overflow-hidden">
        {/* Section header */}
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="section-label mb-3">Fresh In</p>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none">
              Latest<br />Arrivals
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-3 section-label text-muted hover:text-terracotta transition-colors group"
          >
            View All
            <span className="block w-8 h-px bg-muted group-hover:bg-terracotta group-hover:w-12 transition-all duration-500" />
          </Link>
        </div>

        {/* Horizontal scroll rail */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pl-6 md:pl-12 pr-6">
          {ARRIVALS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.7, ease: [0.16,1,0.3,1] }}
              className="product-card group snap-start shrink-0 w-[48vw] sm:w-[36vw] md:w-[26vw] lg:w-[20vw] xl:w-[17vw]"
            >
              <Link href="/shop">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-bg-warm">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="product-card-img w-full h-full object-cover"
                  />
                  {/* Pre-loved badge */}
                  <span className="absolute top-3 left-3 text-[7px] font-bold uppercase tracking-[0.25em] bg-terracotta/90 text-bg px-2 py-1">
                    Pre-Loved
                  </span>
                  {/* Tag badge */}
                  <span className="absolute top-3 right-3 text-[7px] font-bold uppercase tracking-[0.25em] bg-bg/90 text-text px-2 py-1">
                    {item.tag}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3 md:p-4 flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-wide leading-tight truncate">{item.name}</h3>
                    <p className="text-[8px] text-muted font-medium uppercase tracking-widest mt-0.5">{item.tag}</p>
                  </div>
                  <p className="text-[9px] md:text-[10px] font-black text-terracotta shrink-0">{item.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
          {/* "See All" card */}
          <div className="snap-start shrink-0 w-[48vw] sm:w-[36vw] md:w-[26vw] lg:w-[20vw] xl:w-[17vw] aspect-[3/4] bg-bg-warm border border-border flex flex-col items-center justify-center gap-4 group hover:border-terracotta transition-colors cursor-pointer">
            <Link href="/shop" className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border border-muted group-hover:border-terracotta rounded-full flex items-center justify-center transition-colors">
                <ArrowRight size={16} className="text-muted group-hover:text-terracotta transition-colors" />
              </div>
              <span className="section-label text-muted group-hover:text-terracotta transition-colors">View All</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4 · SHOP BY CATEGORIES
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-bg-warm border-y border-border">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="mb-10 md:mb-14">
            <p className="section-label mb-3">Browse By</p>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none">
              Categories
            </h2>
          </div>

          {/* Category grid — Aged Arc style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16,1,0.3,1] }}
              >
                <Link
                  href={cat.href}
                  className="relative block aspect-[3/4] group overflow-hidden bg-bg border border-border"
                >
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-[1.6s] group-hover:scale-108"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/20 to-transparent" />
                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-display font-black text-lg md:text-2xl uppercase tracking-tight text-text leading-none">
                      {cat.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-terracotta">Browse</span>
                      <ArrowRight size={10} className="text-terracotta" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/shop" className="btn-outline">See All Categories</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5 · WHY CALOTES (Brand Story)
      ══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-40 px-6 md:px-12 max-w-[1800px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="relative aspect-[4/5] overflow-hidden bg-bg-warm group"
          >
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000"
              alt="Vintage Philosophy"
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            {/* Floating "100% Authentic" badge */}
            <div className="absolute bottom-6 right-6 w-28 h-28 bg-bg/95 border border-border-warm rounded-full flex flex-col items-center justify-center text-center shadow-2xl">
              <p className="font-display font-black text-2xl uppercase tracking-tight leading-none">100%</p>
              <p className="text-[8px] text-muted font-bold tracking-[0.3em] uppercase mt-1">Authentic</p>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16,1,0.3,1] }}
            className="flex flex-col gap-8 md:gap-12"
          >
            <div>
              <p className="section-label mb-5">The Philosophy</p>
              <h2 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter leading-[0.85]">
                Authentic.<br />
                <span className="text-terracotta">Curated.</span><br />
                Timeless.
              </h2>
            </div>

            <div className="space-y-5 text-muted text-[11px] uppercase tracking-widest leading-[1.9] font-medium max-w-sm">
              <p>
                We believe true style isn't manufactured — it's discovered. Our selection is curated for those who appreciate the patina of time.
              </p>
              <p className="font-serif italic lowercase text-xl text-text tracking-normal normal-case font-light leading-relaxed">
                "Every garment has a story. We help you continue it."
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Link href="/about" className="btn-primary">Our Story</Link>
              <Link href="/lookbook" className="btn-outline">Lookbook</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6 · LOOKBOOK TEASER
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-bg-warm border-y border-border overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-10 flex justify-between items-end">
          <div>
            <p className="section-label mb-3">Volume I</p>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none">
              The Lookbook
            </h2>
          </div>
          <Link href="/lookbook" className="hidden sm:flex items-center gap-3 section-label text-muted hover:text-terracotta transition-colors group">
            View All
            <span className="block w-8 h-px bg-muted group-hover:bg-terracotta group-hover:w-12 transition-all duration-500" />
          </Link>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pl-6 md:pl-12 pr-6">
          {INSTA_IMGS.map((img, i) => (
            <Link
              key={i}
              href="/lookbook"
              className="shrink-0 w-40 md:w-52 aspect-[3/4] relative group overflow-hidden bg-bg border border-border"
            >
              <img
                src={img}
                alt={`Look ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-bg/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                <span className="text-[8px] font-bold uppercase tracking-widest text-text border border-text/50 px-3 py-1.5">
                  Look {i + 1}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          7 · INSTAGRAM COMMUNITY
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-[1800px] mx-auto w-full">
        <div className="text-center max-w-lg mx-auto mb-16">
          <p className="section-label mb-4">Community</p>
          <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter leading-tight mb-4">
            Wear It. Tag It.
          </h2>
          <p className="text-muted text-[11px] uppercase tracking-widest font-medium">
            @calotes.vintage — Show us how you style your pieces.
          </p>
        </div>

        {/* Instagram grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {INSTA_IMGS.map((img, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square group overflow-hidden bg-bg-warm border border-border"
            >
              <img
                src={img}
                alt="Community post"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                <span className="text-[7px] font-bold uppercase tracking-widest text-text">View</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline flex items-center gap-3"
          >
            Follow @calotes.vintage <ArrowRight size={12} />
          </a>
        </div>
      </section>

    </div>
  );
}
