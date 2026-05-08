"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const VALUES = [
  { n: "01", title: "Authentic",   text: "Every piece is hand-authenticated. No fakes, no compromises." },
  { n: "02", title: "Curated",     text: "We hand-pick every garment. If it doesn't meet our standard, it doesn't make the archive." },
  { n: "03", title: "Sustainable", text: "Pre-owned fashion is the future. We're reducing waste, one garment at a time." },
];

export default function AboutPage() {
  return (
    <div className="w-full pt-28 md:pt-36 pb-24">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="px-6 md:px-12 max-w-[1800px] mx-auto mb-20 md:mb-32">
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="section-label mb-4"
        >
          Our Story
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="font-display font-black text-5xl md:text-8xl lg:text-[8vw] uppercase tracking-tighter leading-[0.85] max-w-5xl"
        >
          Curating History.
          <br />
          <span className="font-serif italic font-light lowercase tracking-normal text-terracotta text-[0.75em]">
            Defying Fast Fashion.
          </span>
        </motion.h1>
      </section>

      {/* ── Hero image grid ────────────────────────────── */}
      <section className="px-6 md:px-12 max-w-[1800px] mx-auto mb-24 md:mb-40">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-[50vh] md:h-[70vh]">
          <div className="md:col-span-2 relative overflow-hidden bg-bg-warm border border-border">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200" alt="Vintage Sourcing" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-bg/40 to-transparent" />
          </div>
          <div className="relative overflow-hidden bg-bg-warm border border-border">
            <img src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800" alt="Vintage Style" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-bg/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────── */}
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto mb-24 md:mb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          >
            <p className="section-label mb-5">The Mission</p>
            <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter leading-[0.9] mb-8">
              Born from rebellion against
              <span className="text-terracotta"> disposable fashion.</span>
            </h2>
            <div className="space-y-5 text-muted text-[11px] uppercase tracking-widest leading-[1.9] font-medium">
              <p>
                Calotes was born from a rebellion against the disposable culture of modern fast fashion. We believe garments are artifacts — pieces of history that gain character, soul, and value over time.
              </p>
              <p>
                Every piece in our archive is hand-selected, authenticated, and carefully inspected. We source the rarest denim, perfectly broken-in outerwear, and t-shirts that carry decades of character.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="flex flex-col justify-center"
          >
            <div className="bg-bg-warm border border-border-warm p-8 md:p-12">
              <p className="font-serif italic text-xl md:text-2xl leading-relaxed text-text mb-8 font-light">
                "True style cannot be manufactured on an assembly line. It must be discovered — in thrift stores, flea markets, and forgotten wardrobes."
              </p>
              <p className="section-label text-terracotta">— The Founders, Calotes Vintage</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="px-6 md:px-12 max-w-[1800px] mx-auto mb-24">
        <p className="section-label mb-10">What We Stand For</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="bg-bg-warm border border-border p-8 md:p-10 hover:border-terracotta/30 transition-colors"
            >
              <span className="font-display font-black text-5xl text-border select-none block mb-6">{v.n}</span>
              <h3 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight mb-4">{v.title}</h3>
              <p className="text-muted text-[10px] uppercase tracking-widest font-medium leading-[1.9]">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Sustainability callout ────────────────────── */}
      <section className="py-24 md:py-32 bg-bg-warm border-y border-border px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-5">Sustainability</p>
          <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-none mb-8">
            Style Without
            <span className="text-terracotta"> Compromise</span>
          </h2>
          <p className="text-muted text-[11px] uppercase tracking-widest font-medium leading-[1.9] mb-10">
            By choosing pre-owned, you're joining a circular economy that reduces water waste, carbon emissions, and landfill overflow. Look good while doing better.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-3">
            Shop Sustainably <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}
