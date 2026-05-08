"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-warm border-t border-border pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 mb-16 border-b border-border pb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <Link href="/" className="block font-display font-black text-6xl md:text-8xl uppercase tracking-tighter text-text hover:text-terracotta transition-colors leading-none mb-8">
              CALOTES
            </Link>
            <p className="text-[10px] text-muted leading-[1.9] max-w-xs font-medium uppercase tracking-widest mb-10">
              India's premium archive for authentic pre-owned vintage &amp; streetwear. Curated for the modern icon.
            </p>

            {/* Newsletter */}
            <form
              className="flex border-b border-border-warm max-w-sm group pb-3"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Join the archive (email)"
                className="flex-1 bg-transparent text-[9px] font-bold uppercase tracking-[0.3em] outline-none placeholder:text-muted/40 text-text py-2"
              />
              <button
                type="submit"
                className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted hover:text-terracotta transition-colors flex items-center gap-1"
              >
                Join <ArrowUpRight size={11} />
              </button>
            </form>
          </div>

          {/* Shop links */}
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="section-label mb-6">Shop</h4>
            <ul className="space-y-3">
              {["All Archive", "Denim", "Outerwear", "Oversized", "Plus Size", "Accessories"].map(l => (
                <li key={l}>
                  <Link
                    href={`/shop?category=${l.toLowerCase().replace(" ", "-")}`}
                    className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-terracotta transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="section-label mb-6">Info</h4>
            <ul className="space-y-3">
              {["About", "Lookbook", "Shipping", "Returns", "Contact"].map(l => (
                <li key={l}>
                  <Link
                    href={`/${l.toLowerCase()}`}
                    className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-terracotta transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="section-label mb-6">Follow</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-terracotta transition-colors flex items-center gap-1"
                >
                  Instagram <ArrowUpRight size={9} />
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-terracotta transition-colors flex items-center gap-1"
                >
                  WhatsApp <ArrowUpRight size={9} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-bold uppercase tracking-[0.3em] text-muted">
          <p>© {new Date().getFullYear()} Calotes Vintage. Curated in India.</p>
          <p className="font-serif italic lowercase text-sm tracking-normal normal-case font-light text-muted/60">
            "Adapt. Stand Out. Be Calotes."
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-terracotta transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-terracotta transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
