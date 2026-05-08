"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const LOOKS = [
  { img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900",  title: "Look 01", desc: "Oversized Tailoring" },
  { img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=900",  title: "Look 02", desc: "90s Grunge" },
  { img: "https://images.unsplash.com/photo-1556905503-432851888e7b?q=80&w=900",     title: "Look 03", desc: "Utilitarian Archive" },
  { img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=900",  title: "Look 04", desc: "Denim on Denim" },
  { img: "https://images.unsplash.com/photo-1529139572765-798728d32ec4?q=80&w=900",  title: "Look 05", desc: "Y2K Sportswear" },
  { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900",  title: "Look 06", desc: "Classic Americana" },
  { img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=900",  title: "Look 07", desc: "Warm Winter Layers" },
  { img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=900",  title: "Look 08", desc: "Military Aesthetic" },
];

export default function LookbookPage() {
  return (
    <div className="w-full pt-28 md:pt-36 pb-24">

      {/* Header */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto border-b border-border pb-12 mb-14">
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="section-label mb-3"
        >
          Volume I · Spring 2025
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="font-display font-bold text-6xl md:text-8xl lg:text-[9vw] uppercase tracking-tight leading-[0.82]"
        >
          The<br />
          <span className="font-serif italic font-light lowercase tracking-normal text-terracotta text-[0.8em]">
            Lookbook
          </span>
        </motion.h1>
      </div>

      {/* Grid */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {LOOKS.map((look, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className="group relative aspect-[3/4] overflow-hidden bg-bg-warm border border-border"
            >
              <img
                src={look.img}
                alt={look.title}
                className="w-full h-full object-cover transition-transform duration-[1.6s] group-hover:scale-108"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-80" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className="font-display font-black text-sm md:text-base uppercase tracking-tight text-text leading-none">
                  {look.title}
                </h3>
                <p className="text-[8px] font-medium uppercase tracking-widest text-muted mt-1">{look.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 text-center px-6">
        <p className="section-label mb-6">Inspired by these looks?</p>
        <Link href="/shop" className="btn-primary inline-flex items-center gap-3">
          Shop The Collection <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
