// Unused import Link is retained for future routing wrappers if needed
import Link from "next/link";

// Core logo layout component for branding representation
export default function Logo({ className = "" }: { className?: string }) {
  return (
    // Centers text elements and applies group hover transitions
    <div className={`flex flex-col items-center justify-center leading-none ${className} group cursor-pointer`}>
      {/* Primary brand text name using displays condensed Barlow font */}
      <span className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-text group-hover:text-terracotta transition-colors duration-500">
        Calotes
      </span>
      {/* Small subtitle with wide letter-spacing tracking alignment */}
      <span className="text-[7px] font-bold uppercase tracking-[0.6em] text-muted mt-1 group-hover:text-text transition-colors duration-500">
        Vintage
      </span>
    </div>
  );
}

