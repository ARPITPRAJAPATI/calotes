"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ShoppingBag, Menu, X, ChevronDown, Sparkles, Heart, Sun, Moon, User, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const CATEGORIES = [
  { name: "All Items", href: "/shop" },
  { name: "Denim", href: "/shop?category=denim" },
  { name: "Outerwear", href: "/shop?category=outerwear" },
  { name: "Oversized", href: "/shop?category=oversized" },
  { name: "Plus Size", href: "/shop?category=plus-size" },
  { name: "Accessories", href: "/shop?category=accessories" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { setIsCartOpen, cartCount } = useCart();
  const { setIsOpen: setIsWishlistOpen, count: wishlistCount } = useWishlist();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Read theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      requestAnimationFrame(() => {
        setTheme("dark");
      });
    } else {
      document.documentElement.classList.remove("dark");
      requestAnimationFrame(() => {
        setTheme("light");
      });
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lastPathname = useRef(pathname);

  // Close menu on navigation
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      if (mobileMenuOpen) {
        requestAnimationFrame(() => {
          setMobileMenuOpen(false);
        });
      }
    }
  }, [pathname, mobileMenuOpen]);

  // Hide Navbar on administrative dashboard routes after executing all hooks unconditionally
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-700 ${scrolled
            ? "bg-bg/95 backdrop-blur-md border-b border-border py-3"
            : "bg-transparent py-6 md:py-8"
          }`}
      >
        {/* ─── DESKTOP HEADER LAYOUT ─── */}
        <div className="hidden lg:flex max-w-[1800px] mx-auto px-10 items-center justify-between relative w-full">
          {/* Left nav */}
          <nav className="flex items-center gap-8 xl:gap-10">
            <Link href="/shop" className="section-label underline-hover">Shop</Link>
            <Link href="/canvas" className="section-label underline-hover text-terracotta flex items-center gap-1"><Sparkles size={12} /> Studio</Link>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="section-label underline-hover flex items-center gap-1 pb-0.5">
                Categories <ChevronDown size={10} className="mt-0.5" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 w-44 bg-bg-warm border border-border-warm shadow-2xl p-4 flex flex-col gap-3"
                  >
                    {CATEGORIES.map(cat => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        onClick={() => setDropdownOpen(false)}
                        className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted hover:text-text transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/lookbook" className="section-label underline-hover">Lookbook</Link>
            <Link href="/about" className="section-label underline-hover">About</Link>
          </nav>

          {/* Center logo (Desktop) */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-20 h-20 md:w-24 md:h-24" />
          </Link>

          {/* Right actions (Desktop) */}
          <div className="flex items-center gap-5 md:gap-7">
            <Link
              href={session ? "/profile" : "/login"}
              className="flex items-center gap-2 section-label hover:text-terracotta transition-colors"
              aria-label={session ? "View Profile" : "Login"}
              title={session ? "Profile" : "Login"}
            >
              <User size={18} strokeWidth={1.5} />
              <span className="hidden sm:block">
                {session ? "Profile" : "Login"}
              </span>
            </Link>

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 section-label hover:text-terracotta transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="hidden sm:block">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-terracotta text-bg text-[8px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Wishlist button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative flex items-center gap-2 section-label hover:text-terracotta transition-colors"
              aria-label="Open wishlist"
            >
              <Heart size={18} strokeWidth={1.5} className="text-text" fill={wishlistCount > 0 ? "currentColor" : "none"} />
              <span className="hidden sm:block">Wishlist</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center gap-2 section-label hover:text-terracotta transition-colors"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              <span className="hidden sm:block">Theme</span>
            </button>
          </div>
        </div>

        {/* ─── MOBILE & TABLET HEADER LAYOUT (pure icons without circles) ─── */}
        <div className="lg:hidden w-full px-4 flex items-center justify-between relative">
          {/* Left actions: Three dots (Menu) + Profile */}
          <div className="flex items-center gap-1.5 xs:gap-2 z-10">
            {/* Menu trigger (pure three-dots icon button) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Open menu"
              title="Menu"
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </button>

            {/* Profile trigger (pure User icon button) */}
            <Link
              href={session ? "/profile" : "/login"}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label={session ? "View Profile" : "Login"}
              title={session ? "Profile" : "Login"}
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Center logo (absolute position for perfect alignment, responsive size to prevent collision) */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center leading-none z-10 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-14 h-14" />
          </Link>

          {/* Right actions: Bag + Wishlist + Theme */}
          <div className="flex items-center gap-1.5 xs:gap-2 z-10">
            {/* Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Open cart"
              title="Bag"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-terracotta text-bg text-[7px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Open wishlist"
              title="Wishlist"
            >
              <Heart size={18} strokeWidth={1.5} fill={wishlistCount > 0 ? "currentColor" : "none"} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────
          Mobile Full-Screen Menu
      ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-bg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-border">
              <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <Logo className="w-14 h-14" />
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="text-text hover:text-terracotta transition-colors flex items-center justify-center"
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? <Sun size={22} strokeWidth={1.5} /> : <Moon size={22} strokeWidth={1.5} />}
                </button>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X size={24} strokeWidth={1} className="text-muted hover:text-text transition-colors" />
                </button>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto px-6 py-10 flex flex-col gap-2">
              {[
                { label: "Items", href: "/shop" },
                { label: "Studio", href: "/canvas" },
                { label: "Lookbook", href: "/lookbook" },
                { label: "About", href: "/about" },
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    className="block font-display font-black text-5xl uppercase tracking-tighter text-text hover:text-terracotta transition-colors leading-tight py-3"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Category pills */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-6 pt-6 border-t border-border"
              >
                <p className="section-label mb-5">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-2 border border-border text-muted hover:border-terracotta hover:text-terracotta transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </nav>

            {/* Footer actions */}
            <div className="px-6 py-6 border-t border-border bg-bg-warm space-y-3">
              <Link
                href={session ? "/profile" : "/login"}
                className="btn-primary w-full flex items-center justify-center py-4"
              >
                {session ? "My Archive" : "Sign In / Register"}
              </Link>
              <div className="flex justify-center gap-6 text-[9px] font-bold uppercase tracking-[0.3em] text-muted pt-2">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">Instagram</a>
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">WhatsApp</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
