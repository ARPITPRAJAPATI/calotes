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
import { ShoppingBag, X, ChevronDown, Sparkles, Heart, Sun, Moon, User, MoreHorizontal } from "lucide-react";
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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Calotes Lizard Contour: Head, Spine Crest, Body & Legs */}
      <path d="M19.5 7c-1-1.2-2.5-2-4.2-2C12 5 9 7 7.5 10H5a2 2 0 0 0-2 2v.5A2.5 2.5 0 0 0 5.5 15H7c1.4 0 2.6.7 3.3 1.8.6 1 1.4 1.8 2.4 2.2" />
      {/* Dorsal Spine Spikes */}
      <path d="M10.5 5.2L11.5 6.8" />
      <path d="M13 4.5L14 6.3" />
      <path d="M15.5 4.8L16.2 6.5" />
      {/* Calotes Lizard Eye */}
      <circle cx="17.8" cy="7.8" r="0.9" fill="currentColor" />
      {/* Spiral Curled Chameleon Tail */}
      <path d="M12.7 19c1.6.8 3.5.5 4.5-.6 1.3-1.3.9-3.4-.7-4.1-1.3-.5-2.5.2-2.7 1.3-.2 1.1.7 1.8 1.6 1.6" />
      {/* Front Leg */}
      <path d="M8 15l-1.5 3.2h2" />
    </svg>
  );
}

// Renders ALL 3 theme icons always — CSS shows/hides based on html class.
// Zero React state needed = zero hydration mismatch possible.
function CSSThemeIcons({ size = 18 }: { size?: number }) {
  return (
    <>
      <span className="theme-icon-moon">
        <Moon size={size} strokeWidth={1.5} />
      </span>
      <span className="theme-icon-calotes">
        <ChameleonIcon size={size} className="text-terracotta animate-pulse" />
      </span>
      <span className="theme-icon-light">
        <Sun size={size} strokeWidth={1.5} />
      </span>
    </>
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
  const [theme, setTheme] = useState<"light" | "dark" | "calotes">("dark");
  // clientReady: false during SSR and hydration, true only after first client paint
  // useEffect with [] fires ONCE after hydration is complete — never during SSR
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    // Read actual theme from localStorage after hydration
    const stored = (localStorage.getItem("theme") as "light" | "dark" | "calotes" | null) || "dark";
    setTheme(stored);
    setClientReady(true);
  }, []); // Empty: runs exactly once after mount, never during hydration

  // Sync DOM classes on pathname changes (calotes mode only applies on home page)
  useEffect(() => {
    const stored = (localStorage.getItem("theme") as "light" | "dark" | "calotes" | null) || "dark";
    document.documentElement.classList.remove("dark", "theme-calotes");
    if (stored === "calotes") {
      document.documentElement.classList.add(pathname === "/" ? "theme-calotes" : "dark");
    } else if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [pathname]);

  // Callback to cycle theme options: Dark -> Calotes Adaptive (Home Only) -> Light -> Dark
  const toggleTheme = () => {
    document.documentElement.classList.remove("dark", "theme-calotes");
    if (theme === "dark") {
      setTheme("calotes");
      document.documentElement.classList.add(pathname === "/" ? "theme-calotes" : "dark");
      localStorage.setItem("theme", "calotes");
    } else if (theme === "calotes") {
      setTheme("light");
      localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
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

  const lastPathname = useRef(pathname);

  // Auto-close mobile dropdown menus whenever a user clicks navigation links and routes update
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname;
      if (mobileMenuOpen) {
        requestAnimationFrame(() => setMobileMenuOpen(false));
      }
    }
  }, [pathname, mobileMenuOpen]);

  // Hide Navbar completely on administrative dashboard panel layout views
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Sticky header container */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-bg/98 border-b border-border py-3 shadow-xs" : "bg-transparent py-6 md:py-8"
        }`}
      >
        {/* ─── DESKTOP HEADER LAYOUT ─── */}
        <div className="hidden lg:flex max-w-[1800px] mx-auto px-10 items-center justify-between relative w-full">
          {/* Left Navigation Links */}
          <nav className="flex items-center gap-8 xl:gap-10">
            <Link href="/shop" className="section-label underline-hover">Shop</Link>
            <Link href="/canvas" className="section-label underline-hover text-terracotta flex items-center gap-1">
              <Sparkles size={12} /> Studio
            </Link>

            {/* Desktop Categories Dropdown trigger */}
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
              <span className="hidden sm:block">{session ? "Profile" : "Login"}</span>
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
              {/* fill="none" on server, actual count after mount — no hydration mismatch */}
              <Heart size={18} strokeWidth={1.5} className="text-text" fill={clientReady && wishlistCount > 0 ? "currentColor" : "none"} />
              <span className="hidden sm:block">Wishlist</span>
            </button>

            {/* 3-Way Theme toggle — CSS shows correct icon, no React state needed */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center gap-2 section-label hover:text-terracotta transition-colors"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              <CSSThemeIcons size={18} />
              <span className="hidden sm:block theme-icon-moon">Dark</span>
              <span className="hidden sm:block theme-icon-calotes">Calotes</span>
              <span className="hidden sm:block theme-icon-light">Light</span>
            </button>
          </div>
        </div>

        {/* ─── MOBILE & TABLET HEADER LAYOUT ─── */}
        <div className="lg:hidden w-full px-4 flex items-center justify-between relative">
          {/* Left actions: Menu + Profile */}
          <div className="flex items-center gap-1.5 xs:gap-2 z-10">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Open menu"
              title="Menu"
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </button>
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
            {/* Mobile Theme toggle — CSS driven */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              <CSSThemeIcons size={18} />
            </button>
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.5} fill={clientReady && wishlistCount > 0 ? "currentColor" : "none"} />
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
                  <CSSThemeIcons size={22} />
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
                <a href="https://www.instagram.com/calotes.live/" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">Instagram</a>
                <a href="https://api.whatsapp.com/send?phone=919953861654" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">WhatsApp</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
