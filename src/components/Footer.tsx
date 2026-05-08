"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-dark border-t border-border pt-24 pb-12 px-6 md:px-12 text-text relative z-10">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20 border-b border-border pb-20">
          
          {/* Brand Col */}
          <div className="md:col-span-5">
            <span className="font-display font-black text-5xl md:text-6xl uppercase tracking-tighter block mb-6">
              CALOTES
            </span>
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-10 font-bold tracking-wide">
              Adapt. Stand Out. Be Calotes. <br />
              India's premium archive for authentic pre-owned vintage and streetwear.
            </p>
            
            {/* Newsletter */}
            <form className="flex border-b border-border pb-2 max-w-sm group" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Join the archive (Email)"
                className="flex-1 bg-transparent text-xs font-bold uppercase tracking-widest outline-none placeholder:text-muted/50 py-2 transition-colors group-focus-within:text-accent"
              />
              <button type="submit" className="text-xs font-black uppercase tracking-widest text-text hover:text-accent-2 transition-colors px-2 flex items-center gap-1">
                Subscribe <ArrowUpRight size={14} />
              </button>
            </form>
          </div>

          {/* Links Cols */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">Shop</h4>
            <ul className="space-y-4">
              {["All Archive", "Denim", "Outerwear", "Plus Size", "Accessories"].map(l => (
                <li key={l}>
                  <Link href={`/shop/${l.toLowerCase().replace(' ', '-')}`} className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">Info</h4>
            <ul className="space-y-4">
              {["About Us", "Shipping Policy", "Returns", "Size Guide", "Contact"].map(l => (
                <li key={l}>
                  <Link href={`/${l.toLowerCase().replace(' ', '-')}`} className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors underline-hover">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8">Socials</h4>
            <ul className="space-y-4">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-1 underline-hover">
                  Instagram <ArrowUpRight size={10} />
                </a>
              </li>
              <li>
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-1 underline-hover">
                  WhatsApp <ArrowUpRight size={10} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          <p>&copy; {new Date().getFullYear()} Calotes Vintage. Curated in India.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
