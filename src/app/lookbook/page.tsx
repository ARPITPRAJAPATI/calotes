"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const LOOKS = [
  { img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800", title: "Look 01", desc: "Oversized Tailoring" },
  { img: "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?q=80&w=800", title: "Look 02", desc: "90s Grunge" },
  { img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800", title: "Look 03", desc: "Utilitarian Archive" },
  { img: "https://images.unsplash.com/photo-1434389670869-c87520f92276?q=80&w=800", title: "Look 04", desc: "Denim on Denim" },
  { img: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800", title: "Look 05", desc: "Y2K Sportswear" },
  { img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800", title: "Look 06", desc: "Classic Americana" },
];

export default function LookbookPage() {
  return (
    <div className="w-full pt-32 pb-24">
      {/* Header */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto border-b border-border pb-12 mb-16 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-4"
        >
          Volume I
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter leading-[0.85]"
        >
          The Lookbook
        </motion.h1>
      </div>

      {/* Masonry / Staggered Grid */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {LOOKS.map((look, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="break-inside-avoid group relative overflow-hidden bg-card border border-border/50"
            >
              <img src={look.img} alt={look.title} className="w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex justify-between items-end">
                <div>
                  <h3 className="text-card font-display font-black text-2xl uppercase tracking-tighter mb-1">{look.title}</h3>
                  <p className="text-card/70 text-[10px] font-bold uppercase tracking-widest">{look.desc}</p>
                </div>
                <Link href="/shop" className="w-10 h-10 rounded-full bg-accent text-bg flex items-center justify-center hover:bg-card hover:text-accent transition-colors">
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Callout */}
      <div className="mt-32 text-center px-6">
        <h2 className="font-display font-black text-4xl uppercase tracking-tighter mb-8">Inspired?</h2>
        <Link href="/shop" className="awwwards-btn inline-flex items-center gap-3">
          Shop The Archive <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
