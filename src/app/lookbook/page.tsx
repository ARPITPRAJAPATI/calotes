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

      {/* Grid of Small Photos */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {LOOKS.map((look, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative aspect-square rounded-[2rem] overflow-hidden bg-bg-dark border border-border/20"
            >
              <img src={look.img} alt={look.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
                <h3 className="text-white font-display font-black text-xs md:text-sm uppercase tracking-[0.2em] mb-1">{look.title}</h3>
                <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.3em]">{look.desc}</p>
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
