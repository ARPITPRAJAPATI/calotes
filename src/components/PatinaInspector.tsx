"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Tag, Scissors, Droplets, Scan, Target, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PatinaInspectorProps {
  images: string[];
  productName: string;
  brand: string;
  condition: string;
  category?: string;
  onClose: () => void;
}

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  icon: React.ElementType;
  title: string;
  detail: string;
  verdict: string;
  tag: string;
}

function buildHotspots(brand: string, condition: string, category: string): Hotspot[] {
  const conditionTagline: Record<string, string> = {
    Excellent: "Museum-grade preservation. Zero structural compromise.",
    Great: "Strong vintage character. Minimal wear, maximum story.",
    Good: "Well-loved with authentic lived-in patina.",
    Fair: "Heavy character piece. Bold vintage soul.",
  };
  const conditionNote = conditionTagline[condition] ?? "Authentically pre-loved.";
  const isBold = condition === "Fair" || condition === "Good";

  return [
    {
      id: "tag",
      label: "A",
      x: 72,
      y: 18,
      icon: Tag,
      title: "Brand Authentication Tag",
      detail: `This ${brand} piece carries its original woven label intact. The font weight, thread color, and union loop-stitch placement are consistent with period-accurate ${brand} archive production. Chain-stitch lockdown at tag hem corners confirms pre-1990s origin.`,
      verdict: "Authentic — Original Label Intact",
      tag: "ARCHIVE VERIFIED",
    },
    {
      id: "seam",
      label: "B",
      x: 28,
      y: 55,
      icon: Scissors,
      title: "Single-Stitch Seam Tailoring",
      detail: `The sleeve and side hem seams show classic single-needle stitching at 7–8 stitches per inch, the hallmark of${isBold ? " hard-worn" : " well-preserved"} pre-mass-production ${category} garments. This density is impossible to replicate in modern fast-fashion runs.`,
      verdict: "Single-Needle Construction Confirmed",
      tag: "VINTAGE ORIGIN",
    },
    {
      id: "patina",
      label: "C",
      x: 50,
      y: 80,
      icon: Droplets,
      title: "Wash Patina & Fading",
      detail: `${conditionNote} The fading gradient follows organic wash cycles, not chemical treatment. Sun-bleach whiskers radiate outward from stress points — a pattern that requires years of real wear to achieve.`,
      verdict: isBold ? "Character Patina — Deeply Aged" : "Natural Patina — Clean & Honest",
      tag: "ORGANIC FADE",
    },
  ];
}

const LENS_SIZE = 160;
const ZOOM_FACTOR = 2.5;

export default function PatinaInspector({
  images,
  productName,
  brand,
  condition,
  category = "Vintage",
  onClose,
}: PatinaInspectorProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensActive, setLensActive] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const hotspots = buildHotspots(brand, condition, category);
  const heroImage = images[0] || "";
  const activeData = hotspots.find((h) => h.id === activeHotspot);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scan line animation
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 3000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = ((ts - start) % duration) / duration;
      setScanLine(progress * 100);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || isMobile) return;
    const rect = imageRef.current.getBoundingClientRect();
    setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [isMobile]);

  const imageW = imageRef.current?.offsetWidth || 1;
  const imageH = imageRef.current?.offsetHeight || 1;
  const lensBgX = 50 - (lensPos.x / imageW) * 100 * (ZOOM_FACTOR - 1);
  const lensBgY = 50 - (lensPos.y / imageH) * 100 * (ZOOM_FACTOR - 1);
  const lensBgPosition = `${lensBgX}% ${lensBgY}%`;

  const handleHotspot = (id: string) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.94)" }}
    >
      {/* ── HUD Bar ─────────────────────────────── */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between px-4 md:px-8 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <Scan size={11} className="text-[#C45B3A] animate-pulse shrink-0" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60 truncate">
            <span className="hidden sm:inline">Calotes · </span>Patina Inspector
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden sm:block text-[8px] font-bold uppercase tracking-widest text-[#C45B3A]">
            {hotspots.length} Points
          </span>
          <button
            onClick={onClose}
            className="p-1.5 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-all duration-200"
            aria-label="Close inspector"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ────────────────────────────────────────── */}
      {isMobile && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Image zone — fixed height on mobile */}
          <div className="relative flex-1 min-h-0">
            <div
              ref={imageRef}
              className="relative w-full h-full overflow-hidden"
            >
              <img
                src={heroImage}
                alt={productName}
                className="w-full h-full object-contain"
                draggable={false}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Scan line */}
              {imageLoaded && (
                <div
                  className="absolute left-0 right-0 h-px pointer-events-none z-10"
                  style={{
                    top: `${scanLine}%`,
                    background: "linear-gradient(90deg, transparent, #C45B3A55, #C45B3Aaa, #C45B3A55, transparent)",
                  }}
                />
              )}

              {/* Subtle grid */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage: "linear-gradient(rgba(196,91,58,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(196,91,58,0.8) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Hotspot pins */}
              {imageLoaded && hotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  onClick={() => handleHotspot(hotspot.id)}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  aria-label={`Inspect: ${hotspot.title}`}
                >
                  <span className="absolute inset-0 rounded-full bg-[#C45B3A]/25 animate-ping scale-[2]" />
                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-200 ${
                    activeHotspot === hotspot.id
                      ? "bg-[#C45B3A] border-[#C45B3A] text-white scale-110"
                      : "bg-black/75 border-[#C45B3A]/90 text-[#C45B3A]"
                  }`}>
                    {hotspot.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom panel — hotspot tabs + detail */}
          <div className="flex-shrink-0 border-t border-white/10" style={{ background: "rgba(10,10,10,0.97)" }}>
            {/* Tab row */}
            <div className="flex border-b border-white/8">
              {hotspots.map((hs) => (
                <button
                  key={hs.id}
                  onClick={() => handleHotspot(hs.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200 border-b-2 ${
                    activeHotspot === hs.id
                      ? "border-[#C45B3A] bg-[#C45B3A]/8"
                      : "border-transparent"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border ${
                    activeHotspot === hs.id
                      ? "bg-[#C45B3A] border-[#C45B3A] text-white"
                      : "border-[#C45B3A]/50 text-[#C45B3A]"
                  }`}>
                    {hs.label}
                  </div>
                  <span className={`text-[7px] font-black uppercase tracking-wider leading-none text-center ${
                    activeHotspot === hs.id ? "text-white" : "text-white/40"
                  }`}>
                    {hs.tag}
                  </span>
                </button>
              ))}
            </div>

            {/* Detail content */}
            <AnimatePresence mode="wait">
              {activeData ? (
                <motion.div
                  key={activeData.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 py-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <activeData.icon size={10} className="text-[#C45B3A] shrink-0" />
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[#C45B3A]">{activeData.tag}</span>
                  </div>
                  <h3 className="text-[12px] font-black uppercase tracking-tight text-white leading-tight">
                    {activeData.title}
                  </h3>
                  <p className="text-[10px] leading-relaxed text-white/50 font-medium line-clamp-3">
                    {activeData.detail}
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-white/8">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C45B3A] shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/70">
                      {activeData.verdict}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-5"
                >
                  <ChevronDown size={12} className="text-white/20" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25">
                    Tap a pin to inspect
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── DESKTOP LAYOUT ───────────────────────────────────────── */}
      {!isMobile && (
        <div className="flex-1 flex items-center justify-center overflow-hidden px-8 py-6">
          <div className="flex items-start gap-8 w-full max-w-[1300px] h-full">

            {/* Image zone */}
            <div className="relative flex-shrink-0 w-[340px] xl:w-[400px]">
              {/* Corner crosshairs */}
              {[
                ["top-0 left-0", 0],
                ["top-0 right-0", 1],
                ["bottom-0 left-0", 2],
                ["bottom-0 right-0", 3],
              ].map(([pos, i]) => (
                <div key={String(i)} className={`absolute ${pos} w-5 h-5 z-10 pointer-events-none`}>
                  <div className={`absolute w-full h-px bg-[#C45B3A]/50 ${Number(i) < 2 ? "top-0" : "bottom-0"}`} />
                  <div className={`absolute h-full w-px bg-[#C45B3A]/50 ${Number(i) % 2 === 0 ? "left-0" : "right-0"}`} />
                </div>
              ))}

              <div
                ref={imageRef}
                className="relative aspect-[3/4] overflow-hidden cursor-crosshair select-none"
                style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setLensActive(true)}
                onMouseLeave={() => setLensActive(false)}
              >
                <img
                  src={heroImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onLoad={() => setImageLoaded(true)}
                />

                {/* Scan line */}
                {imageLoaded && (
                  <div
                    className="absolute left-0 right-0 h-px pointer-events-none z-20"
                    style={{
                      top: `${scanLine}%`,
                      background: "linear-gradient(90deg, transparent, #C45B3A44, #C45B3Acc, #C45B3A44, transparent)",
                    }}
                  />
                )}

                {/* Grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-10 opacity-[0.08]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(196,91,58,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(196,91,58,0.5) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Hotspot pins */}
                {imageLoaded && hotspots.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    onClick={() => handleHotspot(hotspot.id)}
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    title={hotspot.title}
                  >
                    <span className="absolute inset-0 rounded-full bg-[#C45B3A]/25 animate-ping scale-[2]" />
                    <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black border transition-all duration-250 ${
                      activeHotspot === hotspot.id
                        ? "bg-[#C45B3A] border-[#C45B3A] text-white scale-110"
                        : "bg-black/75 border-[#C45B3A]/80 text-[#C45B3A] group-hover:scale-110 group-hover:bg-[#C45B3A] group-hover:text-white"
                    }`}>
                      {hotspot.label}
                    </div>
                  </button>
                ))}

                {/* Magnifying lens */}
                <AnimatePresence>
                  {lensActive && imageLoaded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute pointer-events-none z-40"
                      style={{
                        width: LENS_SIZE,
                        height: LENS_SIZE,
                        left: lensPos.x - LENS_SIZE / 2,
                        top: lensPos.y - LENS_SIZE / 2,
                        borderRadius: "50%",
                        border: "2px solid rgba(196,91,58,0.8)",
                        boxShadow: "0 0 0 1px rgba(196,91,58,0.15), 0 0 24px rgba(196,91,58,0.12)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url(${heroImage})`,
                          backgroundSize: `${ZOOM_FACTOR * 100}%`,
                          backgroundPosition: lensBgPosition,
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-full h-px bg-[#C45B3A]/25" />
                        <div className="absolute w-px h-full bg-[#C45B3A]/25" />
                        <div className="w-2.5 h-2.5 rounded-full border border-[#C45B3A]/50" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hint */}
              <p className="text-center text-[7px] font-bold uppercase tracking-[0.3em] text-white/20 mt-3">
                Hover to magnify · Click pins to inspect
              </p>
            </div>

            {/* Sidebar */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-y-auto no-scrollbar py-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <Target size={9} className="text-[#C45B3A]" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/35">
                  Inspection Points
                </span>
              </div>

              {/* Hotspot list */}
              <div className="space-y-2">
                {hotspots.map((hs) => (
                  <button
                    key={hs.id}
                    onClick={() => handleHotspot(hs.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 border transition-all duration-250 text-left group ${
                      activeHotspot === hs.id
                        ? "border-[#C45B3A]/50 bg-[#C45B3A]/8"
                        : "border-white/8 hover:border-white/18 bg-white/[0.01] hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border shrink-0 transition-all ${
                      activeHotspot === hs.id
                        ? "bg-[#C45B3A] border-[#C45B3A] text-white"
                        : "border-[#C45B3A]/50 text-[#C45B3A]"
                    }`}>
                      {hs.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[9px] font-black uppercase tracking-wider leading-tight transition-colors ${
                        activeHotspot === hs.id ? "text-white" : "text-white/55 group-hover:text-white/80"
                      }`}>
                        {hs.title}
                      </p>
                      <p className="text-[7px] font-bold uppercase tracking-widest text-[#C45B3A]/55 mt-0.5">{hs.tag}</p>
                    </div>
                    <ChevronRight
                      size={10}
                      className={`shrink-0 transition-all ${
                        activeHotspot === hs.id ? "text-[#C45B3A] translate-x-0.5" : "text-white/15"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Detail panel */}
              <AnimatePresence mode="wait">
                {activeData ? (
                  <motion.div
                    key={activeData.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="border border-[#C45B3A]/25 p-5 relative mt-2"
                    style={{ background: "linear-gradient(135deg, rgba(196,91,58,0.06) 0%, rgba(0,0,0,0.3) 100%)" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <activeData.icon size={10} className="text-[#C45B3A]" />
                      <span className="text-[7px] font-black uppercase tracking-[0.35em] text-[#C45B3A]">
                        {activeData.tag}
                      </span>
                    </div>
                    <h3 className="text-[12px] font-black uppercase tracking-tight text-white leading-tight mb-3">
                      {activeData.title}
                    </h3>
                    <p className="text-[10px] leading-relaxed text-white/50 font-medium mb-4">
                      {activeData.detail}
                    </p>
                    <div className="flex items-center gap-2 border-t border-white/8 pt-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C45B3A] shrink-0" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/70">
                        {activeData.verdict}
                      </span>
                    </div>
                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-6 h-6">
                      <div className="absolute top-0 right-0 w-full h-px bg-[#C45B3A]" />
                      <div className="absolute top-0 right-0 w-px h-full bg-[#C45B3A]" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-2 py-8 border border-white/6"
                    style={{ background: "rgba(255,255,255,0.01)" }}
                  >
                    <Target size={20} className="text-white/10" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                      Select an inspection point
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
