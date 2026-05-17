'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md border-4 border-text p-8 md:p-12 bg-bg shadow-[8px_8px_0_0_#0F0A05] space-y-6">
        <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] bg-terracotta text-bg px-3 py-1">
          System Interruption
        </span>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter text-text">
          Archive Lost
        </h1>
        <p className="text-xs text-muted font-medium leading-relaxed uppercase tracking-wider">
          An unexpected error occurred while retrieving our curated clothing pieces. The digital catalog could not be retrieved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-text text-bg hover:bg-bg hover:text-text border border-text text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5 cursor-pointer"
          >
            Retry Request
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-text hover:bg-text hover:text-bg text-text text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] active:translate-y-0.5"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
