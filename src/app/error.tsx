'use client';
 
import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
 
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-4xl md:text-6xl font-playfair font-black mb-4">Oops!</h2>
      <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-6">Something went wrong</h3>
      <p className="text-muted max-w-md mb-8">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-text text-bg px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-terracotta transition-colors"
      >
        <RotateCcw size={16} />
        Try again
      </button>
    </div>
  );
}
