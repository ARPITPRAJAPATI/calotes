"use client";

import { useState } from "react";
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

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-full bg-bg-warm flex items-center justify-center text-[8px] font-bold uppercase tracking-widest text-muted">
        No Image
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full group/slider overflow-hidden">
      {/* Slider viewport */}
      <div className="w-full h-full relative">
        <img
          src={images[currentIdx]}
          alt={`${productName} - view ${currentIdx + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isSoldOut ? "opacity-60 grayscale-[40%]" : ""
          }`}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg/90 border border-border flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 hover:bg-text hover:text-bg cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={12} strokeWidth={2} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg/90 border border-border flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 hover:bg-text hover:text-bg cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={12} strokeWidth={2} />
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
