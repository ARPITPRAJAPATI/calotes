'use client'; // Marks this banner as a client-side component to access localStorage and layout mount effects

// Import state tracking and side effect hooks
import { useState, useEffect } from 'react';
// Import router path hook to conditionally show/hide based on current path location
import { usePathname } from 'next/navigation';
// Import Framer Motion transition animation libraries
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const pathname = usePathname(); // Track active route path location
  const [isVisible, setIsVisible] = useState(false); // Controls display state of the banner popup

  // Trigger evaluation checks on mount and whenever the URL path name changes
  useEffect(() => {
    // Completely hide the cookie banner on administrative panel route layouts
    if (pathname?.startsWith('/admin')) {
      if (isVisible) {
        requestAnimationFrame(() => {
          setIsVisible(false); // Instantly close banner if currently visible
        });
      }
      return; // Stop execution
    }
    
    // Inspect browser storage to verify if the user has previously accepted cookie consent
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing the popup slightly (1.5 seconds) for a premium, natural site entry feel
      const timer = setTimeout(() => {
        setIsVisible(true); // Open banner
      }, 1500);
      return () => clearTimeout(timer); // Clean up timing loop if the component unmounts early
    }
  }, [pathname, isVisible]);

  // Action callback to record consent preference and dismiss dialog
  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true'); // Persist user agreement flag
    setIsVisible(false); // Close layout drawer
  };

  return (
    // AnimatePresence listens to exit transitions before nodes unmount from layout
    <AnimatePresence>
      {isVisible && (
        <motion.div
          // Slide upwards from below (y: 20) and fade in (opacity: 1) on load
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          // Slide down and fade out on exit
          exit={{ y: 20, opacity: 0 }}
          // Custom cubic-bezier easing to resemble smooth native app experiences
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-[340px] px-4 sm:px-0"
        >
          {/* Main banner box styling using a premium editorial brutalist theme */}
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
              {/* Acceptance trigger button */}
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

