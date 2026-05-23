"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageSliderProps {
  images: string[];
  productName: string;
  isSoldOut?: boolean;
}

export default function ProductImageSlider({
  images,
  productName,
  isSoldOut = false,
}: ProductImageSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-full bg-bg-warm flex items-center justify-center text-[8px] font-bold uppercase tracking-widest text-muted">
        No Image
      </div>
    );
  }

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; // initialize
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const threshold = 40; // minimum touch swipe offset in px
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > threshold) {
      e.preventDefault();
      e.stopPropagation();
      if (diff > 0) {
        // Swiped Left -> show next image
        handleNext();
      } else {
        // Swiped Right -> show previous image
        handlePrev();
      }
    }
  };

  return (
    <div 
      className="relative w-full h-full group/slider overflow-hidden cursor-pointer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider viewport */}
      <div className="w-full h-full relative">
        <Image
          src={images[currentIdx]}
          alt={`${productName} - view ${currentIdx + 1}`}
          fill
          sizes="(max-width: 640px) 48vw, (max-width: 768px) 36vw, (max-width: 1024px) 26vw, (max-width: 1280px) 20vw, 17vw"
          className={`object-cover transition-opacity duration-300 ${
            isSoldOut ? "opacity-60 grayscale-[40%]" : ""
          }`}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:text-terracotta flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-all duration-300 z-10 cursor-pointer"
            style={{ border: 'none', background: 'transparent', outline: 'none', boxShadow: 'none' }}
            aria-label="Previous image"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-terracotta flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-all duration-300 z-10 cursor-pointer"
            style={{ border: 'none', background: 'transparent', outline: 'none', boxShadow: 'none' }}
            aria-label="Next image"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Slide Indicators / Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`h-0.5 transition-all duration-300 ${
                currentIdx === idx ? "w-4 bg-text" : "w-1 bg-muted/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
