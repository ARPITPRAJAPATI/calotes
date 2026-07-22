'use client';

import { ReactNode } from 'react';

// Lightweight page wrapper — avoids AnimatePresence main-thread blocking during initial page load
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  );
}
