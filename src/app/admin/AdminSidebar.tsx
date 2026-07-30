'use client'; // Flags this file as a client component to support toggling responsive sidebars and click listeners

// Import React state hooks
import { useState } from 'react';
// Import Link for page transitions
import Link from 'next/link';
// Import UI vector icons
import { Menu, X, ArrowLeft } from 'lucide-react';
// Import Admin nav links component wrapper
import AdminNav from './AdminNav';

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false); // Controls opening and closing mobile drawer overlays

  return (
    <>
      {/* Mobile/Tablet View Header Bar: shown only on smaller screens */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-card border-b border-border flex items-center justify-between px-6 z-50">
        <Link href="/admin" className="font-display font-black text-xl uppercase tracking-tighter">
          Calotes Admin
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-border bg-bg text-text hover:bg-bg-warm transition-all duration-200 cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar overlay backdrop for mobile viewports */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
          onClick={() => setIsOpen(false)} // Close menu on click
        />
      )}

      {/* Sidebar Navigation Panel (Responsive layout transition offsets) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border flex flex-col shrink-0 z-50 lg:z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 pt-16 lg:pt-0 shadow-[8px_0_24px_rgba(0,0,0,0.2)]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Desktop Branding Header: shown on large viewports */}
        <div className="hidden lg:block p-6 border-b border-border">
          <Link href="/admin" className="font-display font-black text-2xl uppercase tracking-tighter hover:opacity-80 transition-opacity">
            Calotes Admin
          </Link>
        </div>

        {/* Sidebar Nav links */}
        <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
          <AdminNav />
        </div>

        {/* Sidebar Footer Link (Return to primary customer storefront collection) */}
        <div className="p-4 border-t border-border bg-bg-warm/30">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:bg-bg hover:text-text transition-colors border border-transparent hover:border-border"
          >
            <ArrowLeft size={18} /> Back to Store
          </Link>
        </div>
      </aside>
    </>
  );
}

