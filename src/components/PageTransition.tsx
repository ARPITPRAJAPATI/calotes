'use client'; // Marks this component as client-side code running inside browser transition handlers

// Import Framer Motion animation wrappers
import { motion, AnimatePresence } from 'framer-motion';
// Import pathname utility hook
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

// Transition component wrapped around root page modules to add enter/exit routes animations
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname(); // Track active route path location

  return (
    // AnimatePresence mode="wait" ensures old page exit transition completes before new page begins mounting
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // Dynamic key setting (forces transition trigger on path change)
        // Set starting state properties (opacity 0, y offset 10px below)
        initial={{ opacity: 0, y: 10 }}
        // Set standard resting properties (opacity 1, y offset 0)
        animate={{ opacity: 1, y: 0 }}
        // Set unmount exit transitions (opacity 0, y offset -10px upwards)
        exit={{ opacity: 0, y: -10 }}
        // Define animation speed metrics
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

