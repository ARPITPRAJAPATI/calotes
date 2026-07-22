"use client"; // Declares this component executes in the client runtime (enables hooks and page location detection)

// Import useState hook to manage drawer close action
import { useState } from "react";
// Import hook to hide components based on active router URL path mapping
import { usePathname } from "next/navigation";
// Import Framer Motion for slide-up dismiss animations
import { motion, AnimatePresence } from "framer-motion";
// Import Lucide React icons
import { X, Star } from "lucide-react";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true); // Toggle visibility state
  const pathname = usePathname(); // Track active route path location

  // Hide the Announcement bar on administrative dashboard path layouts
  if (pathname?.startsWith("/admin")) {
    return null; // Return empty rendering (no layout mount)
  }

  return (
    // AnimatePresence coordinates layout sizing adjustments on dismiss
    <AnimatePresence>
      {isVisible && (
        <motion.div
          // Slide open height from 0 on load, and reverse height to 0 on exit
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-black text-white overflow-hidden relative z-[100]"
        >
          {/* Scrolling ticker track container */}
          <div className="py-1.5 flex whitespace-nowrap items-center marquee-track">
            {/* Create 4 copies of text array for continuous ticker loop */}
            {[...Array(4)].map((_, i) => (
              <span key={i} className="font-display font-black text-[9px] uppercase tracking-[0.2em] mx-4 flex items-center gap-4">
                Free Shipping on orders above ₹2999 <Star size={8} fill="currentColor" />
                Authentic Vintage Selection <Star size={8} fill="currentColor" />
                New Items Weekly <Star size={8} fill="currentColor" />
              </span>
            ))}
          </div>
          
          {/* Close action trigger button (positioned absolutely on the right) */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-0 top-0 bottom-0 px-3 z-10 bg-black hover:text-terracotta transition-colors flex items-center justify-center border-l border-white/10"
            aria-label="Close announcement"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

