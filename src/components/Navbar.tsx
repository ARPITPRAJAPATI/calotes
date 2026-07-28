"use client"; // Flags this component as a client component to allow browser interactions (hooks, theme manipulation)

// Import React hooks for managing state variables, side effect triggers, and ref persistence
import { useState, useEffect, useRef } from "react";
// Import Link for page transitions
import Link from "next/link";
// Import hook to watch path location
import { usePathname } from "next/navigation";
// Import session provider hooks to monitor user account login status
import { useSession } from "next-auth/react";
// Import custom hooks to control bag and wishlist drawers
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
// Import UI vector icon components
import { ShoppingBag, Menu, X, ChevronDown, Sparkles, Heart, Sun, Moon, User, MoreHorizontal } from "lucide-react";
// Import Framer Motion animations
import { motion, AnimatePresence } from "framer-motion";
// Import Branding logo component
import Logo from "./Logo";

// Config navigation links mapping categories filter search queries
const CATEGORIES = [
  { name: "All Items", href: "/shop" },
  { name: "Denim", href: "/shop?category=denim" },
  { name: "Outerwear", href: "/shop?category=outerwear" },
  { name: "Oversized", href: "/shop?category=oversized" },
  { name: "Plus Size", href: "/shop?category=plus-size" },
  { name: "Accessories", href: "/shop?category=accessories" },
];

function ChameleonIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 5c-1.5 0-3 1.2-4.5 2.5C12.8 9 10.5 10 8 10H6a3 3 0 0 0-3 3v.5A2.5 2.5 0 0 0 5.5 16H6c2.5 0 4.8 1 6.5 2.5C14 19.8 15.5 21 17 21a3 3 0 0 0 3-3v-1.5M18 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M9 13.5h.01" />
      <path d="M13 13.5h.01" />
      <path d="M6 16c-1 1.5-2.5 2-4 2" />
      <path d="M17 16.5c1 1.2 2 1.5 3.5 1" />
    </svg>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const { setIsCartOpen, cartCount } = useCart();
  const { setIsOpen: setIsWishlistOpen, count: wishlistCount } = useWishlist();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "calotes">("light");

  // Hydrate theme settings from browser storage on initial page load
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | "calotes" | null;
    document.documentElement.classList.remove("dark", "theme-calotes");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else if (stored === "calotes") {
      document.documentElement.classList.add("theme-calotes");
      setTheme("calotes");
    } else {
      setTheme("light");
    }
  }, []);

  // Callback to cycle theme options: Light -> Dark -> Calotes Adaptive -> Light
  const toggleTheme = () => {
    document.documentElement.classList.remove("dark", "theme-calotes");
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "dark") {
      setTheme("calotes");
      document.documentElement.classList.add("theme-calotes");
      localStorage.setItem("theme", "calotes");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
  };

  // Add passive scroll event listener to dynamically apply blur/border styling only when threshold changes
  useEffect(() => {
    let prev = false;
    const onScroll = () => {
      const isScrolled = window.scrollY > 40;
      if (isScrolled !== prev) {
        prev = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lastPathname = useRef(pathname); // Persist reference to previous route path name

  // Auto-close mobile dropdown menus whenever a user clicks navigation links and routes update
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      if (mobileMenuOpen) {
        requestAnimationFrame(() => {
          setMobileMenuOpen(false); // Close sliding mobile menu
        });
      }
    }
  }, [pathname, mobileMenuOpen]);

  // Hide Navbar completely on administrative dashboard panel layout views
  if (pathname?.startsWith("/admin")) {
    return null; // Stop rendering
  }

  return (
    <>
      {/* Sticky header container */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${scrolled
            ? "bg-bg/98 border-b border-border py-3 shadow-xs"
            : "bg-transparent py-6 md:py-8"
          }`}
      >
        {/* ─── DESKTOP HEADER LAYOUT ─── */}
        <div className="hidden lg:flex max-w-[1800px] mx-auto px-10 items-center justify-between relative w-full">
          {/* Left Navigation Links */}
          <nav className="flex items-center gap-8 xl:gap-10">
            <Link href="/shop" className="section-label underline-hover">Shop</Link>
            <Link href="/canvas" className="section-label underline-hover text-terracotta flex items-center gap-1"><Sparkles size={12} /> Studio</Link>

            {/* Desktop Categories Dropdown trigger */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="section-label underline-hover flex items-center gap-1 pb-0.5">
                Categories <ChevronDown size={10} className="mt-0.5" />
              </button>

              {/* Animate list items on hover status */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 w-44 bg-bg-warm border border-border-warm shadow-2xl p-4 flex flex-col gap-3"
                  >
                    {/* Render category listings */}
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

          {/* Center Logo branding (Desktop view) */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-20 h-20 md:w-24 md:h-24" />
          </Link>

          {/* Right Action button group (Desktop view) */}
          <div className="flex items-center gap-5 md:gap-7">
            {/* Account Profile / Login redirect Link */}
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

            {/* Shopping Bag trigger button */}
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

            {/* Saved Wishlist trigger button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative flex items-center gap-2 section-label hover:text-terracotta transition-colors"
              aria-label="Open wishlist"
            >
              <Heart size={18} strokeWidth={1.5} className="text-text" fill={wishlistCount > 0 ? "currentColor" : "none"} />
              <span className="hidden sm:block">Wishlist</span>
            </button>
            {/* 3-Way Mode Theme switch trigger button (Light -> Dark -> Calotes Adaptive -> Light) */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center gap-2 section-label hover:text-terracotta transition-colors"
              aria-label="Toggle Theme"
              title={theme === "light" ? "Switch to Dark Mode" : theme === "dark" ? "Switch to Calotes Adaptive Mode" : "Switch to Light Mode"}
            >
              {theme === "light" && <Sun size={18} strokeWidth={1.5} />}
              {theme === "dark" && <Moon size={18} strokeWidth={1.5} />}
              {theme === "calotes" && <ChameleonIcon size={18} className="text-terracotta animate-pulse" />}
              <span className="hidden sm:block">
                {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Calotes"}
              </span>
            </button>
          </div>
        </div>

        {/* ─── MOBILE & TABLET HEADER LAYOUT (pure icons without circles) ─── */}
        <div className="lg:hidden w-full px-4 flex items-center justify-between relative">
          {/* Left actions: Menu + Profile */}
          <div className="flex items-center gap-1.5 xs:gap-2 z-10">
            {/* Menu trigger button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Open menu"
              title="Menu"
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </button>

            {/* Profile / Account Login Link */}
            <Link
              href={session ? "/profile" : "/login"}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label={session ? "View Profile" : "Login"}
              title={session ? "Profile" : "Login"}
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Center Logo branding */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center leading-none z-10 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-12 h-12" />
          </Link>

          {/* Right actions: Theme + Wishlist + Bag */}
          <div className="flex items-center gap-1.5 xs:gap-2 z-10">
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Toggle Theme"
              title={theme === "light" ? "Switch to Dark Mode" : theme === "dark" ? "Switch to Calotes Adaptive Mode" : "Switch to Light Mode"}
            >
              {theme === "light" && <Sun size={18} strokeWidth={1.5} />}
              {theme === "dark" && <Moon size={18} strokeWidth={1.5} />}
              {theme === "calotes" && <ChameleonIcon size={18} className="text-terracotta animate-pulse" />}
            </button>
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.5} fill={wishlistCount > 0 ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta text-bg font-black text-[8px] rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE FULL-SCREEN SLIDE MENU ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-bg flex flex-col overflow-hidden"
          >
            {/* Header section with brand logo and modal dismiss button */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-border">
              <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <Logo className="w-14 h-14" />
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="text-text hover:text-terracotta transition-colors flex items-center justify-center gap-1.5"
                  aria-label="Toggle Theme"
                >
                  {theme === "light" && <Sun size={22} strokeWidth={1.5} />}
                  {theme === "dark" && <Moon size={22} strokeWidth={1.5} />}
                  {theme === "calotes" && <ChameleonIcon size={22} className="text-terracotta animate-pulse" />}
                </button>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X size={24} strokeWidth={1} className="text-muted hover:text-text transition-colors" />
                </button>
              </div>
            </div>

            {/* Scrollable list of navigation page routes */}
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
                  // Cascade delay calculations based on index listing positions
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

              {/* Horizontal filter category pills */}
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

            {/* Bottom action redirects and social media links */}
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

