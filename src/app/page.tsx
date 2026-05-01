"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

const MENS_PRODUCTS = [
  { id: 1, name: "Vintage Levi's 501", price: "₹3,499", tag: "Archive", img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Carhartt Detroit Jacket", price: "₹7,999", tag: "Rare", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Harley Davidson Tee", price: "₹2,499", tag: "Y2K", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "Military Field Jacket", price: "₹6,499", tag: "1 of 1", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop" },
];

export default function Home() {
  const { data: session } = useSession();
  const { setIsCartOpen, cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress, scrollY } = useScroll();
  const heroImgY = useTransform(scrollYProgress, [0, 0.5], [0, 180]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <div className="bg-bg text-text font-sans selection:bg-text selection:text-bg overflow-x-hidden">

      {/* ── CURSOR ── */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full bg-accent pointer-events-none z-[999] hidden lg:block"
        animate={{ x: mousePos.x - 6, y: mousePos.y - 6, scale: hovering ? 3.5 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-bg-dark text-card py-2.5 overflow-hidden relative z-50">
        <motion.div
          animate={{ x: [0, -1400] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
          className="flex whitespace-nowrap text-[10px] font-bold tracking-[0.25em] uppercase"
        >
          {[...Array(8)].map((_, i) => (
            <span key={i} className="mx-10 opacity-70">
              Free Shipping Over ₹3,000 &nbsp;·&nbsp; Worldwide Delivery &nbsp;·&nbsp; Adapt. Stand Out. Be Calotes.
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── HEADER ── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-700 ${scrolled ? 'bg-bg/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'}`}
        style={{ top: scrolled ? 0 : 40 }}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          {/* Left Nav */}
          <div className="hidden lg:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold">
            {[{name:"New In", href:"/shop"}, {name:"Mens", href:"/shop?category=mens"}, {name:"Womens", href:"/shop?category=womens"}, {name:"Archive", href:"/shop"}].map(l => (
              <Link key={l.name} href={l.href}
                onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
                className="underline-hover hover:text-accent transition-colors"
              >{l.name}</Link>
            ))}
          </div>

          {/* Logo — center */}
          <Link href="/" className="flex-1 flex justify-center lg:justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <span className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter hover:text-accent transition-colors duration-500 text-text">
              CALOTES
            </span>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            {session ? (
              <Link href="/profile" className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.2em] underline-hover hover:text-accent transition-colors"
                onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
                Account
              </Link>
            ) : (
              <Link href="/login" className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.2em] underline-hover hover:text-accent transition-colors"
                onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
                Login
              </Link>
            )}

            {/* CART BUTTON — properly wired */}
            <button
              id="cart-toggle"
              onClick={() => setIsCartOpen(true)}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors group relative"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="hidden lg:inline">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-card text-[8px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] bg-bg-dark text-card flex flex-col p-8"
          >
          <div className="flex justify-between items-center pb-10 border-b border-white/10">
            <span className="font-display font-black text-2xl uppercase tracking-tighter text-card">Calotes</span>
            <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} strokeWidth={1.5} className="text-card" /></button>
          </div>
            <nav className="flex-1 flex flex-col justify-center gap-2">
              {["New In", "Mens", "Womens", "Archive", "Sale"].map((item, i) => (
                <motion.div key={item} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 + 0.2 }}>
                  <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-display font-black text-5xl uppercase tracking-tighter text-card py-3 hover:text-accent transition-colors">
                    {item}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="border-t border-white/10 pt-6 flex justify-between text-[10px] font-bold uppercase tracking-widest text-card/50">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <button onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}>Bag [{cartCount}]</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>

        {/* ── HERO ── Full screen, Bottega/Celine-style */}
        <section className="relative w-full h-screen overflow-hidden bg-black">
          <motion.div style={{ scale, y: heroImgY }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-70 scale-105"
              poster="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=2000"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-black-outfit-39850-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-10" />
          </motion.div>

          {/* Hero Text */}
          <motion.div style={{ opacity: heroOpacity, y: textY }} className="absolute inset-0 z-20 flex flex-col justify-end pb-12 sm:pb-24 px-6 sm:px-12 md:px-20">
            <div className="max-w-[1800px] mx-auto w-full flex flex-col md:flex-row justify-between items-end gap-10 sm:gap-12">
              <div className="flex flex-col items-start w-full relative">
                {/* Background "CALOTES" Watermark - Dynamic */}
                <motion.div 
                  style={{ x: useTransform(scrollYProgress, [0, 0.2], [0, 100]) }}
                  className="absolute -top-20 -left-10 select-none pointer-events-none opacity-[0.03]"
                >
                  <span className="font-display font-black text-[25vw] uppercase leading-none">ARCHIVE</span>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                    }
                  }}
                  className="flex flex-col w-full relative z-10"
                >
                  <div className="overflow-hidden">
                    <motion.h2
                      variants={{
                        hidden: { y: "100%", skewX: -20 },
                        visible: { y: 0, skewX: 0 }
                      }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display font-black text-[18vw] sm:text-[15vw] leading-[0.75] uppercase tracking-[-0.08em] text-card flex items-baseline gap-2"
                    >
                      ADAPT<span className="text-accent text-[4vw]">.</span>
                    </motion.h2>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: "40px" }} transition={{ delay: 1, duration: 1 }}
                      className="h-px bg-accent/50 hidden sm:block" 
                    />
                    <motion.h2
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="font-display font-black text-[12vw] sm:text-[10vw] leading-none uppercase tracking-[0.2em] text-outline"
                      style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', color: 'transparent' }}
                    >
                      STAND
                    </motion.h2>
                  </div>

                  <div className="overflow-hidden -mt-2">
                    <motion.h2
                      variants={{
                        hidden: { y: "100%", scaleY: 2 },
                        visible: { y: 0, scaleY: 1 }
                      }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display font-black text-[18vw] sm:text-[15vw] leading-[0.8] uppercase tracking-[-0.05em] text-card"
                    >
                      OUT
                    </motion.h2>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="flex flex-col gap-6 items-start md:items-end w-full md:w-auto"
              >
                <div className="flex flex-col gap-2 items-start md:items-end">
                  <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em]">Est. 2026 Archive</span>
                  <p className="text-card/60 text-[10px] font-bold uppercase tracking-[0.25em] max-w-[280px] text-left md:text-right leading-relaxed">
                    Globally sourced vintage. Authenticated & curated for those who dare to lead.
                  </p>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href="/shop"
                    onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
                    className="awwwards-btn-accent px-10 py-5 text-sm inline-flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start overflow-hidden group"
                  >
                    <span className="relative z-10">Enter Collection</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <ArrowRight size={18} className="relative z-10" />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4"
          >
            <div className="relative w-px h-16 bg-card/20 overflow-hidden">
              <motion.div 
                animate={{ y: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 w-full h-full bg-accent"
              />
            </div>
            <span className="text-card/30 text-[8px] font-black uppercase tracking-[0.4em]">Explore</span>
          </motion.div>
        </section>

        {/* ── SOCIAL PROOF TRUST BAR ── */}
        <div className="bg-bg-dark text-card py-10 px-6 sm:px-12">
          <div className="max-w-[1800px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 text-center">
            {[
              { stat: "23K+", label: "Instagram Followers" },
              { stat: "1,326+", label: "Archive Pieces" },
              { stat: "100%", label: "Hand Verified" },
              { stat: "Est. 2022", label: "Calotes Vintage" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="font-display font-black text-3xl sm:text-4xl text-accent tracking-tighter">{item.stat}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-card/50">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BRAND STATEMENT ── */}
        <section className="py-24 sm:py-32 px-6 sm:px-12 border-b border-border">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-7">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-6">The Calotes Philosophy</p>
              <h2 className="font-display font-black text-5xl sm:text-6xl md:text-7xl uppercase tracking-tighter leading-[0.9]">
                Every garment<br />has a story.<br />
                <span className="text-accent italic font-serif font-normal tracking-normal normal-case">Wear yours.</span>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-sm text-muted leading-relaxed font-medium mb-8">
                Calotes curates exceptional pre-owned fashion from around the globe — pieces with history, character, and soul. Because real style isn't manufactured. It's discovered.
              </p>
              <Link href="/shop" className="awwwards-btn inline-flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                Browse The Archive <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── GENDER EDITORIAL SPLIT ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 min-h-screen md:min-h-[85vh]">
          {/* MENS */}
          <div className="group relative overflow-hidden cursor-pointer h-[50vh] md:h-auto bg-bg-dark">
            <motion.img
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              src="/mens-hero.png"
              alt="Shop Mens"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
              <p className="text-card/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">— Collection 01</p>
              <h3 className="font-display font-black text-5xl sm:text-6xl text-card uppercase tracking-tighter leading-[0.9] mb-6">Mens</h3>
              <Link href="/shop?category=mens" className="awwwards-btn text-card border-card/30 inline-flex items-center gap-3 hover:text-text w-full sm:w-auto justify-center">
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* WOMENS */}
          <div className="group relative overflow-hidden cursor-pointer h-[50vh] md:h-auto bg-bg">
            <motion.img
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              src="/womens-hero.png"
              alt="Shop Womens"
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
              <p className="text-card/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">— Collection 02</p>
              <h3 className="font-display font-black text-5xl sm:text-6xl text-card uppercase tracking-tighter leading-[0.9] mb-6">Womens</h3>
              <Link href="/shop?category=womens" className="awwwards-btn text-card border-card/30 inline-flex items-center gap-3 hover:text-text w-full sm:w-auto justify-center">
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── CINEMATIC VIDEO SECTION ── */}
        <section className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-girl-walking-along-the-beach-at-sunset-4024-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
          
          <div className="relative z-10 text-center text-card px-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.4em] mb-6"
            >
              The Archive Experience
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="font-display font-black text-5xl sm:text-7xl md:text-9xl uppercase tracking-tighter leading-none mb-12"
            >
              Beyond <br/> <span className="text-outline" style={{ WebkitTextStroke: '1px white' }}>Vintage.</span>
            </motion.h2>
            <Link href="/shop" className="awwwards-btn text-white border-white/40 hover:text-black hover:border-white w-full sm:w-auto justify-center">
              Explore The Vault
            </Link>
          </div>
        </section>

        {/* ── MARQUEE DIVIDER ── */}
        <div className="py-8 bg-accent overflow-hidden">
          <motion.div animate={{ x: [0, -1600] }} transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
            className="flex whitespace-nowrap">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-card font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter mx-8 sm:mx-12 opacity-90">
                Calotes Archive &nbsp;·&nbsp; Adapt. Stand Out. &nbsp;·&nbsp; Be Calotes. &nbsp;·&nbsp;
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── MENS PRODUCTS GRID ── */}
        <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-[1800px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16 border-b border-border pb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-3">Latest Drops</p>
              <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter">New Arrivals</h2>
            </div>
            <Link href="/shop" className="awwwards-btn inline-flex items-center gap-3 w-full sm:w-auto justify-center">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {MENS_PRODUCTS.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                <Link href="/shop">
                  <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
                    <span className="absolute top-3 left-3 z-10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-bg-dark text-card px-2 py-0.5 sm:px-2.5 sm:py-1">
                      {product.tag}
                    </span>
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-bg-dark hidden sm:block">
                      <span className="text-card text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        View Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted">{product.price}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ADAPT STAND OUT SECTION ── */}
        <section className="relative py-32 sm:py-64 px-6 text-center bg-black text-card overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
          {/* Brand Motion Video Background with dynamic scale */}
          <motion.div 
            style={{ scale }}
            className="absolute inset-0 z-0"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-50"
              poster="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-black-outfit-39850-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          </motion.div>

          <div className="relative z-10 max-w-5xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-8">Archival Excellence</p>
              <h2 className="font-display font-black text-6xl sm:text-8xl md:text-[12vw] uppercase tracking-tighter leading-[0.75] mb-12">
                Adapt.<br />Stand Out.<br />
                <span className="text-outline italic" style={{ WebkitTextStroke: '1px white' }}>
                  Be Calotes.
                </span>
              </h2>
            </motion.div>

            {/* Dynamic Brand Reel */}
            <div className="mt-12 mb-16 overflow-hidden w-full">
              <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                className="flex whitespace-nowrap gap-12 sm:gap-24 opacity-30"
              >
                {["LEVI'S", "CARHARTT", "RALPH LAUREN", "GUCCI", "PRADA", "DIOR", "NIKE", "ADIDAS", "YSL"].map(brand => (
                  <span key={brand} className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter">{brand}</span>
                ))}
                {["LEVI'S", "CARHARTT", "RALPH LAUREN", "GUCCI", "PRADA", "DIOR", "NIKE", "ADIDAS", "YSL"].map(brand => (
                  <span key={brand+"_copy"} className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter">{brand}</span>
                ))}
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-8">
              <p className="text-card/50 text-[10px] font-bold uppercase tracking-[0.4em] max-w-sm mx-auto leading-loose">
                Globally sourced. Hand picked. <br/> Curated for the modern icon.
              </p>
              <Link href="/shop" className="awwwards-btn-accent inline-flex items-center gap-3 w-full sm:w-auto justify-center group">
                Enter The Archive 
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-bg border-t border-border pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20 border-b border-border pb-20">
            <div className="md:col-span-5">
              <span className="font-display font-black text-5xl uppercase tracking-tighter block mb-8">CALOTES</span>
              <p className="text-sm text-muted leading-relaxed max-w-sm mb-10">
                Adapt. Stand Out. Be Calotes. — India's most curated archive of authentic pre-owned fashion.
              </p>
              <form className="flex border-b border-border pb-1" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email"
                  className="flex-1 bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none placeholder:text-muted py-3"
                />
                <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-text transition-colors px-4">
                  Subscribe
                </button>
              </form>
            </div>

            <div className="md:col-span-2 md:col-start-7">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-6">Shop</h4>
              <ul className="space-y-4">
                {["New In", "Mens", "Womens", "Y2K Archive", "Sale"].map(l => (
                  <li key={l}><Link href="/shop" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">{l}</Link></li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-6">Info</h4>
              <ul className="space-y-4">
                {["About", "Shipping", "Returns", "Contact", "FAQ"].map(l => (
                  <li key={l}><a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-6">Follow</h4>
              <ul className="space-y-4">
                <li><a href="https://www.instagram.com/calotes.vintage/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">Instagram</a></li>
                <li><a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">Pinterest</a></li>
                <li><a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">Twitter</a></li>
                <li><a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">TikTok</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            <p>&copy; {new Date().getFullYear()} Calotes Vintage. All Rights Reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-text transition-colors">Privacy</a>
              <a href="#" className="hover:text-text transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
