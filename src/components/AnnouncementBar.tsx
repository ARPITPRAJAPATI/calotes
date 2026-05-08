"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-black text-white overflow-hidden relative z-[100]"
        >
          <div className="py-1.5 flex whitespace-nowrap items-center marquee-track">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="font-display font-black text-[9px] uppercase tracking-[0.2em] mx-4 flex items-center gap-4">
                Free Shipping on orders above ₹2999 <Star size={8} fill="currentColor" />
                Authentic Vintage Selection <Star size={8} fill="currentColor" />
                New Items Weekly <Star size={8} fill="currentColor" />
              </span>
            ))}
          </div>
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
