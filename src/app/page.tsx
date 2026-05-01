"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X, ArrowRight, Heart } from "lucide-react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effect for hero
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isMobileMenuOpen]);

  const products = [
    { id: 1, name: "VINTAGE HARLEY DAVIDSON TEE", price: "₹2,499", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop" },
    { id: 2, name: "90S CARHARTT DETROIT JACKET", price: "₹7,999", oldPrice: "₹9,999", image: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop" },
    { id: 3, name: "LEVIS 501 ORIGINAL FIT", price: "₹3,499", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop" },
    { id: 4, name: "NIKE SPELLOUT SWEATSHIRT", price: "₹4,299", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop" }
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden selection:bg-black selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT BAR (Black) */}
      <div className="bg-black text-white py-2 flex items-center overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="flex whitespace-nowrap font-bold text-[11px] tracking-[0.2em] uppercase"
        >
          {[...Array(12)].map((_, i) => (
            <span key={i} className="mx-8 flex items-center">
              FREE SHIPPING OVER ₹3000 <span className="mx-8">•</span> 10% STUDENT DISCOUNT <span className="mx-8">•</span> WORLDWIDE DELIVERY
            </span>
          ))}
        </motion.div>
      </div>

      {/* 2. MAIN HEADER (Logo, Search, Icons) */}
      <header className="bg-white px-4 md:px-8 py-4 lg:py-6 relative z-40 border-b border-gray-200 lg:border-none">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Mobile Left */}
          <div className="flex-1 flex items-center lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1">
              <Menu size={24} />
            </button>
            <button className="ml-4 p-1"><Search size={20} /></button>
          </div>

          {/* Desktop Left */}
          <div className="hidden lg:flex flex-1 items-center gap-6">
            <button className="flex items-center gap-2 hover:opacity-50 transition-opacity">
              <Search size={18} strokeWidth={2} />
              <span className="text-xs font-bold tracking-[0.1em] uppercase">Search</span>
            </button>
          </div>

          {/* Center Logo */}
          <div className="flex-1 flex justify-center">
            <a href="#" className="font-display font-black text-4xl lg:text-6xl tracking-tighter uppercase leading-none">
              CALOTES
            </a>
          </div>

          {/* Right Icons */}
          <div className="flex-1 flex items-center justify-end gap-4 lg:gap-6">
            <a href="#" className="hidden lg:block text-xs font-bold tracking-[0.1em] uppercase hover:opacity-50 transition-opacity">Log In</a>
            <button className="hidden lg:block hover:opacity-50 transition-opacity"><Heart size={20} strokeWidth={2}/></button>
            <button className="hover:opacity-50 transition-opacity relative flex items-center gap-2">
              <ShoppingBag size={20} strokeWidth={2}/>
              <span className="hidden lg:block text-xs font-bold">(0)</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. STICKY NAVIGATION (Desktop only) */}
      <nav className={`hidden lg:block bg-white border-y border-gray-200 transition-all z-50 ${scrolled ? 'fixed top-0 w-full shadow-sm' : 'relative'}`}>
        <div className="max-w-[1400px] mx-auto flex justify-center gap-10 py-4 text-[13px] font-bold tracking-[0.1em] uppercase">
          {['New In', 'Womens', 'Mens', 'Brands', 'Y2K Archive', 'Reworked', 'Sale'].map((item) => (
            <a key={item} href="#" className={`relative group transition-colors ${item === 'Sale' ? 'text-red-600' : 'hover:text-gray-500'}`}>
              <span>{item}</span>
              <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-black scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
            </a>
          ))}
        </div>
      </nav>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "easeOut" as const }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <span className="font-display font-black text-2xl tracking-tighter">CALOTES</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <nav className="flex flex-col gap-6 text-xl font-bold uppercase tracking-wider">
                {['New In', 'Womens', 'Mens', 'Brands', 'Y2K Archive', 'Reworked', 'Sale'].map((item, i) => (
                  <motion.a 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                    key={item} href="#" 
                    className={`border-b border-gray-100 pb-4 ${item === 'Sale' ? 'text-red-600' : ''}`}
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* 4. HERO SECTION (Parallax) */}
        <section className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden bg-black flex items-center justify-center">
          <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
            <img 
              src="https://images.unsplash.com/photo-1617331713506-c8ec23c218fb?q=80&w=2160&auto=format&fit=crop" 
              alt="Editorial Vintage" 
              className="w-full h-full object-cover object-center opacity-70"
            />
          </motion.div>
          <div className="relative z-10 text-center px-4 mt-20">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-white font-display font-black text-5xl md:text-8xl tracking-tighter uppercase mb-6 leading-[0.9]"
            >
              The Spring <br/> Collection
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <a href="#" className="inline-block bg-white text-black px-12 py-4 font-bold text-xs tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-colors duration-300">
                Shop Now
              </a>
            </motion.div>
          </div>
        </section>

        {/* 5. GENDER SPLIT CATEGORIES */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          {[{title: "Shop Mens", img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop"}, 
            {title: "Shop Womens", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"}].map((cat) => (
            <div key={cat.title} className="group relative h-[40vh] md:h-[60vh] overflow-hidden cursor-pointer">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                src={cat.img} alt={cat.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h2 className="text-white font-display font-black text-4xl md:text-6xl uppercase tracking-tighter pointer-events-auto">
                  <a href="#" className="hover:underline underline-offset-8">{cat.title}</a>
                </h2>
              </div>
            </div>
          ))}
        </section>

        {/* 6. NEW ARRIVALS CAROUSEL */}
        <section className="py-16 md:py-24 max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-10 border-b border-black pb-4">
            <h2 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tighter">New Arrivals</h2>
            <a href="#" className="hidden sm:inline-block font-bold text-xs tracking-[0.1em] uppercase hover:opacity-50 transition-opacity">
              View All
            </a>
          </div>

          {/* Horizontal scroll on mobile, Grid on desktop */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-4 md:gap-6 pb-8 md:pb-0 hide-scrollbar"
          >
            {products.map((product) => (
              <motion.div variants={fadeUp} key={product.id} className="min-w-[75vw] sm:min-w-[45vw] md:min-w-0 snap-start group cursor-pointer flex flex-col">
                <div className="relative aspect-[3/4] bg-[#f4f4f4] overflow-hidden mb-4">
                  <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                    New
                  </div>
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white text-black font-bold uppercase tracking-widest text-[10px] py-3 w-full hover:bg-black hover:text-white transition-colors border border-black shadow-lg">
                      Quick View
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-[11px] md:text-xs uppercase tracking-wider mb-1 line-clamp-1">{product.name}</h3>
                <div className="flex gap-2 items-center text-[13px] md:text-sm">
                  {product.oldPrice && <span className="text-gray-500 line-through">{product.oldPrice}</span>}
                  <span className={product.oldPrice ? 'text-red-600 font-bold' : 'font-bold'}>{product.price}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <a href="#" className="sm:hidden block w-full text-center border border-black py-4 mt-6 font-bold text-xs tracking-widest uppercase">
            View All Arrivals
          </a>
        </section>

        {/* 7. EDITORIAL BANNERS */}
        <section className="px-4 md:px-8 max-w-[1800px] mx-auto pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative aspect-[4/3] overflow-hidden bg-black"
            >
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8 }}
                src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1200&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end pointer-events-none text-white">
                <h3 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tighter mb-4">Designer Archive</h3>
                <span className="font-bold text-xs tracking-widest uppercase border-b border-white w-max pointer-events-auto hover:text-gray-300 transition-colors">Shop Collection</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative aspect-[4/3] overflow-hidden bg-black"
            >
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8 }}
                src="https://images.unsplash.com/photo-1571513722275-4b41940f54b4?q=80&w=1200&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end pointer-events-none text-white">
                <h3 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tighter mb-4">Premium Outerwear</h3>
                <span className="font-bold text-xs tracking-widest uppercase border-b border-white w-max pointer-events-auto hover:text-gray-300 transition-colors">Discover Jackets</span>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* 8. FOOTER - Clean Rokit Style */}
      <footer className="bg-[#F8F8F8] pt-16 md:pt-24 pb-12 border-t border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Newsletter */}
            <div className="lg:col-span-5 pr-0 lg:pr-12">
              <h4 className="font-display font-black text-3xl uppercase tracking-tighter mb-4">Stay In The Loop</h4>
              <p className="text-sm text-gray-600 mb-6">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
              <form className="flex border-b border-black">
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL" 
                  className="w-full bg-transparent py-3 text-xs font-bold outline-none uppercase tracking-widest"
                />
                <button type="submit" className="font-bold text-xs tracking-widest uppercase px-4 hover:opacity-50 transition-opacity">
                  Subscribe
                </button>
              </form>
            </div>
            
            {/* Quick Links */}
            <div className="lg:col-span-2 lg:col-start-7">
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 border-b border-gray-300 pb-2">Shop</h4>
              <ul className="space-y-4 text-[11px] font-bold tracking-widest uppercase text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Mens</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Womens</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Accessories</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Brands</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Sale</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 border-b border-gray-300 pb-2">Info</h4>
              <ul className="space-y-4 text-[11px] font-bold tracking-widest uppercase text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 border-b border-gray-300 pb-2">Social</h4>
              <ul className="space-y-4 text-[11px] font-bold tracking-widest uppercase text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-black transition-colors">TikTok</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pinterest</a></li>
              </ul>
            </div>
            
          </div>
          
          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] gap-4 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} CALOTES VINTAGE.</p>
            <div className="flex gap-4">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles for hide-scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
