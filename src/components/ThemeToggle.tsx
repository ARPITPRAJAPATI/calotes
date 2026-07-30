"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

// Calotes Lizard Icon
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
      <path d="M19.5 7c-1-1.2-2.5-2-4.2-2C12 5 9 7 7.5 10H5a2 2 0 0 0-2 2v.5A2.5 2.5 0 0 0 5.5 15H7c1.4 0 2.6.7 3.3 1.8.6 1 1.4 1.8 2.4 2.2" />
      <path d="M10.5 5.2L11.5 6.8" />
      <path d="M13 4.5L14 6.3" />
      <path d="M15.5 4.8L16.2 6.5" />
      <circle cx="17.8" cy="7.8" r="0.9" fill="currentColor" />
      <path d="M12.7 19c1.6.8 3.5.5 4.5-.6 1.3-1.3.9-3.4-.7-4.1-1.3-.5-2.5.2-2.7 1.3-.2 1.1.7 1.8 1.6 1.6" />
      <path d="M8 15l-1.5 3.2h2" />
    </svg>
  );
}

// ── Shared theme hook ────────────────────────────────────────────────────────
export function useTheme() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark" | "calotes">("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as "light" | "dark" | "calotes" | null) || "dark";
    setTheme(stored);

    document.documentElement.classList.remove("dark", "theme-calotes");
    if (stored === "calotes") {
      document.documentElement.classList.add(pathname === "/" ? "theme-calotes" : "dark");
    } else if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [pathname]);

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

  return { theme, toggleTheme };
}

// ── Desktop theme button (with label) ───────────────────────────────────────
export function DesktopThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 section-label hover:text-terracotta transition-colors"
      aria-label="Toggle Theme"
      title={
        theme === "dark"
          ? "Switch to Calotes Adaptive Mode (Home Only)"
          : theme === "calotes"
          ? "Switch to Light Mode"
          : "Switch to Dark Mode"
      }
    >
      {theme === "dark" && <Moon size={18} strokeWidth={1.5} />}
      {theme === "calotes" && <ChameleonIcon size={18} className="text-terracotta animate-pulse" />}
      {theme === "light" && <Sun size={18} strokeWidth={1.5} />}
      <span className="hidden sm:block">
        {theme === "dark" ? "Dark" : theme === "calotes" ? "Calotes" : "Light"}
      </span>
    </button>
  );
}

// ── Mobile theme button (icon only) ─────────────────────────────────────────
export function MobileThemeToggle({ size = 18 }: { size?: number }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center text-text hover:text-terracotta transition-colors p-1.5"
      aria-label="Toggle Theme"
      title="Toggle Theme"
    >
      {theme === "dark" && <Moon size={size} strokeWidth={1.5} />}
      {theme === "calotes" && <ChameleonIcon size={size} className="text-terracotta animate-pulse" />}
      {theme === "light" && <Sun size={size} strokeWidth={1.5} />}
    </button>
  );
}

// ── Mobile drawer theme button (large, with label) ───────────────────────────
export function DrawerThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="text-text hover:text-terracotta transition-colors flex items-center justify-center gap-1.5"
      aria-label="Toggle Theme"
    >
      {theme === "light" && <Sun size={22} strokeWidth={1.5} />}
      {theme === "dark" && <Moon size={22} strokeWidth={1.5} />}
      {theme === "calotes" && <ChameleonIcon size={22} className="text-terracotta animate-pulse" />}
    </button>
  );
}

// ── Wishlist heart icon (fill depends on client-side context) ────────────────
export function WishlistHeart({ size = 18, className = "" }: { size?: number; className?: string }) {
  const { count } = useWishlist();
  return (
    <Heart
      size={size}
      strokeWidth={1.5}
      className={className}
      fill={count > 0 ? "currentColor" : "none"}
    />
  );
}
