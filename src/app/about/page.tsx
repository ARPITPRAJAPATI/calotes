"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="w-full pt-32 pb-24">
      {/* Hero */}
      <section className="px-6 md:px-12 max-w-[1800px] mx-auto text-center mb-24 md:mb-40">
        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-6"
        >
          Our Story
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display font-black text-5xl sm:text-7xl md:text-9xl uppercase tracking-tighter leading-[0.85] max-w-5xl mx-auto"
        >
          Curating History.<br />
          <span className="text-outline italic" style={{ WebkitTextStroke: '1px var(--color-text)' }}>Defying Fast Fashion.</span>
        </motion.h1>
      </section>

      {/* Image Grid */}
      <section className="px-6 md:px-12 max-w-[1800px] mx-auto mb-32 md:mb-48">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[60vh] md:h-[80vh]">
          <div className="md:col-span-2 relative bg-card border border-border/50">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200" alt="Vintage Sourcing" className="w-full h-full object-cover" />
          </div>
          <div className="relative bg-card border border-border/50 hidden md:block">
            <img src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800" alt="Vintage Style" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto mb-32 md:mb-48">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-[0.9] mb-8">
              The Mission.
            </h2>
            <div className="space-y-6 text-muted font-medium leading-relaxed">
              <p>
                Calotes was born out of a rebellion against the disposable culture of modern fast fashion. We believe that garments are artifacts—pieces of history that gain character, soul, and value over time.
              </p>
              <p>
                Every piece in our archive is hand-selected, authenticated, and restored if necessary. We scour the globe for the rarest denim, the perfectly broken-in outerwear, and the t-shirts that tell a story from decades past.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <div className="bg-card p-8 md:p-12 border border-border/50">
              <p className="text-xl md:text-2xl font-bold leading-relaxed mb-8 text-text">
                "Our archive is curated for the modern icon. Those who understand that true style cannot be manufactured on an assembly line—it must be discovered."
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">— The Founders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-24 md:py-32 bg-bg-dark border-y border-border px-6 md:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-6">Sustainability</p>
          <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none mb-10">
            Style Without Compromise
          </h2>
          <p className="text-card/70 leading-relaxed mb-12">
            By choosing pre-owned and vintage, you're not just making a style statement. You're participating in a circular economy that drastically reduces water waste, carbon emissions, and landfill overflow. Look good while doing better.
          </p>
          <Link href="/shop" className="awwwards-btn-accent inline-flex items-center gap-3">
            Shop Sustainably <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
