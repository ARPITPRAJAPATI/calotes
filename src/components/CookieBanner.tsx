'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Hide CookieBanner on admin routes
  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      if (isVisible) {
        requestAnimationFrame(() => {
          setIsVisible(false);
        });
      }
      return;
    }
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay slightly for premium, natural entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname, isVisible]);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-[340px] px-4 sm:px-0"
        >
          <div className="bg-[#F2EDE6] text-[#111010] border-[1.5px] border-[#111010] p-4 shadow-[4px_4px_0px_0px_#111010] flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-terracotta">
                Cookie Archive
              </span>
              <p className="text-[11px] leading-relaxed font-medium uppercase tracking-wider text-[#111010]/80">
                We use cookies to refine your editorial experience and browse the archive.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1 border-t border-[#111010]/10">
              <button
                onClick={acceptCookies}
                className="px-4 py-1.5 bg-[#111010] text-[#F2EDE6] text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[#F2EDE6] hover:text-[#111010] border border-[#111010] transition-all duration-300 cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
