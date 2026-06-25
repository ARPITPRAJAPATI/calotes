import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center leading-none ${className} group cursor-pointer`}>
      <span className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-text group-hover:text-terracotta transition-colors duration-500">
        Calotes
      </span>
      <span className="text-[7px] font-bold uppercase tracking-[0.6em] text-muted mt-1 group-hover:text-text transition-colors duration-500">
        Vintage
      </span>
    </div>
  );
}
