"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const { setIsCartOpen, cartCount } = useCart();
  const pathname = usePathname();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    { name: "All Archive", href: "/shop" },
    { name: "Denim", href: "/shop/denim" },
    { name: "Outerwear", href: "/shop/outerwear" },
    { name: "Oversized", href: "/shop/oversized" },
    { name: "Plus Size", href: "/shop/plus-size" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? "bg-white/90 backdrop-blur-md border-b border-border py-4" : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Left - Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/shop" className="text-[9px] font-black uppercase tracking-[0.3em] hover:opacity-50 transition-opacity underline-hover">
              Shop
            </Link>
            
            <div 
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.3em] hover:opacity-50 transition-opacity underline-hover pb-1">
                Categories <ChevronDown size={10} />
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-bg-dark border border-border shadow-xl p-4 flex flex-col gap-3"
                  >
                    {categories.map((cat) => (
                      <Link 
                        key={cat.href} 
                        href={cat.href}
                        className="text-xs font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/lookbook" className="text-[9px] font-black uppercase tracking-[0.3em] hover:opacity-50 transition-opacity underline-hover">
              Lookbook
            </Link>
            <Link href="/about" className="text-[9px] font-black uppercase tracking-[0.3em] hover:opacity-50 transition-opacity underline-hover">
              About
            </Link>
          </nav>

          {/* Center - Logo */}
          <Link href="/" className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <span className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter hover:text-accent transition-colors duration-500">
              Calotes
            </span>
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center gap-6">
            <Link 
              href={session ? "/profile" : "/login"} 
              className="hidden lg:block text-[9px] font-black uppercase tracking-[0.3em] hover:opacity-50 transition-opacity underline-hover"
            >
              {session ? "Profile" : "Login"}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] hover:opacity-50 transition-opacity relative group"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent-2 text-bg text-[8px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-text hover:text-accent transition-colors">
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-bg-dark flex flex-col p-8"
          >
            <div className="flex justify-between items-center pb-8 border-b border-border">
              <span className="font-display font-black text-3xl uppercase tracking-tighter">Calotes</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={28} strokeWidth={1.5} className="text-text hover:text-accent" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-8 flex flex-col gap-6">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-display font-black uppercase tracking-tighter hover:text-accent transition-colors">
                Shop All
              </Link>
              
              <div className="space-y-4 pl-4 border-l border-border/50">
                {categories.map((cat) => (
                  <Link 
                    key={cat.href} 
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <Link href="/lookbook" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-display font-black uppercase tracking-tighter hover:text-accent transition-colors mt-4">
                Lookbook
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-display font-black uppercase tracking-tighter hover:text-accent transition-colors">
                About Us
              </Link>
            </nav>

            <div className="border-t border-border pt-8 flex flex-col gap-4">
              <Link 
                href={session ? "/profile" : "/login"} 
                onClick={() => setMobileMenuOpen(false)}
                className="awwwards-btn text-center"
              >
                {session ? "My Account" : "Login / Register"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
