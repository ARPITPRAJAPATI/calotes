'use client';
 
import Link from 'next/link';
import { MoveLeft } from 'lucide-react';
 
export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-6xl md:text-8xl font-playfair font-black mb-4">404</h2>
      <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-6">Page Not Found</h3>
      <p className="text-muted max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/"
        className="flex items-center gap-2 bg-text text-bg px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-terracotta transition-colors"
      >
        <MoveLeft size={16} />
        Back to Home
      </Link>
    </div>
  );
}
