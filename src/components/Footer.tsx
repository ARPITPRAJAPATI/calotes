"use client"; // Marks this component as client-side rendering code (uses routing and location hooks)

// Import Link for internal page routes
import Link from "next/link";
// Import router path hook to conditionally hide footer layout on admin routes
import { usePathname } from "next/navigation";
// Import icons
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname(); // Track active route path location

  // Hide the Footer on all administrative dashboard panel layouts
  if (pathname?.startsWith("/admin")) {
    return null; // Return empty rendering (no layout mount)
  }

  return (
    <footer className="bg-bg-warm border-t border-border pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">

        {/* Top grid layout */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 mb-16 border-b border-border pb-16">

          {/* Brand details column */}
          <div className="col-span-2 md:col-span-5">
            <Link href="/" className="block font-display font-black text-6xl md:text-8xl uppercase tracking-tighter text-text hover:text-terracotta transition-colors leading-none mb-8">
              CALOTES
            </Link>
            <p className="text-[10px] text-muted leading-[1.9] max-w-xs font-medium uppercase tracking-widest mb-10">
              {"India's premium archive for authentic pre-owned vintage & streetwear. Curated for the modern icon."}
            </p>

            {/* Simple decorative newsletter form submission container */}
            <form
              className="flex border-b border-border-warm max-w-sm group pb-3"
              onSubmit={e => e.preventDefault()} // Prevent default page refresh on submit
            >
              <input
                type="email"
                placeholder="JOIN THE MAILING LIST (EMAIL)"
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

          {/* Catalog category link section */}
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="section-label mb-6">Shop</h4>
            <ul className="space-y-3">
              {["All Items", "Denim", "Outerwear", "Oversized", "Plus Size", "Accessories"].map(l => (
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

          {/* Information & Support links section */}
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

          {/* Social media external links section */}
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

        {/* Bottom copyright and legal page links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-bold uppercase tracking-[0.3em] text-muted">
          <p>© {new Date().getFullYear()} Calotes Vintage. Curated in India.</p>
          <p className="font-serif italic lowercase text-sm tracking-normal normal-case font-light text-muted">
            {"\"Adapt. Stand Out. Be Calotes.\""}
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

