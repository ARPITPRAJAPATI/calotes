"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X, Star } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || !visible) return null;

  const handleDismiss = () => {
    setDismissing(true);
    // Wait for CSS transition to complete, then remove from DOM
    setTimeout(() => setVisible(false), 320);
  };

  return (
    <div
      suppressHydrationWarning
      style={{
        maxHeight: dismissing ? "0px" : "60px",
        opacity: dismissing ? 0 : 1,
        overflow: "hidden",
        transition: "max-height 0.3s ease, opacity 0.25s ease",
      }}
      className="bg-bg-warm text-text border-b border-border relative z-[100]"
    >
      <div className="py-1.5 flex whitespace-nowrap items-center marquee-track">
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="font-display font-black text-[9px] uppercase tracking-[0.2em] mx-4 flex items-center gap-4"
          >
            Free Shipping on orders above ₹2999 <Star size={8} fill="currentColor" />
            Authentic Vintage Selection <Star size={8} fill="currentColor" />
            New Items Weekly <Star size={8} fill="currentColor" />
          </span>
        ))}
      </div>
      <button
        suppressHydrationWarning
        onClick={handleDismiss}
        className="absolute right-0 top-0 bottom-0 px-3 z-10 bg-black/80 hover:bg-black hover:text-terracotta transition-colors flex items-center justify-center border-l border-white/10"
        aria-label="Close announcement"
      >
        <X size={12} strokeWidth={3} />
      </button>
    </div>
  );
}
