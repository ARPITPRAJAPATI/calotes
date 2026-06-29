"use client"; // Marks this component as client-rendered (uses states, refs, and browser touch gesture events)

// Import state trackers and coordinate refs
import { useState, useRef } from "react";
// Import optimized image component
import Image from "next/image";
// Import arrows
import { ChevronLeft, ChevronRight } from "lucide-react";

// Types mapping for incoming slider options
interface ProductImageSliderProps {
  images: string[];      // Array list of product image URLs
  productName: string;  // Product name (used as accessibility alt tag)
  isSoldOut?: boolean;  // Scarcity flag to grey out sold items
}

export default function ProductImageSlider({
  images,
  productName,
  isSoldOut = false,
}: ProductImageSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0); // Track active image slide index
  const touchStartX = useRef(0); // Holds touch coordinates ref when gesture starts
  const touchEndX = useRef(0);   // Holds touch coordinates ref when gesture moves

  // Fallback view when image arrays are empty/undefined
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-full bg-bg-warm flex items-center justify-center text-[8px] font-bold uppercase tracking-widest text-muted">
        No Image
      </div>
    );
  }

  // Slide backwards navigation callback
  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Stop click bubble actions
      e.stopPropagation();
    }
    // Loop back to last image if at start of array, else decrement
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Slide forwards navigation callback
  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Stop click bubble actions
      e.stopPropagation();
    }
    // Loop back to index 0 if at end of array, else increment
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Mobile Touch Gestures: Record initial horizontal coordinates ref on screen touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; // Initialize coordinates ref matching start position
  };

  // Mobile Touch Gestures: Update current horizontal position coordinates ref on swipe dragging
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  // Mobile Touch Gestures: Calculate swipe velocity and direction on touch drag release
  const handleTouchEnd = (e: React.TouchEvent) => {
    const threshold = 40; // Minimum touch swipe offset in pixels to trigger navigation change
    const diff = touchStartX.current - touchEndX.current; // Compute drag displacement
    
    // Evaluate if displacement meets trigger threshold
    if (Math.abs(diff) > threshold) {
      e.preventDefault();
      e.stopPropagation();
      if (diff > 0) {
        // Dragged Left -> navigate to show next image
        handleNext();
      } else {
        // Dragged Right -> navigate to show previous image
        handlePrev();
      }
    }
  };

  return (
    <div 
      className="relative w-full h-full group/slider overflow-hidden cursor-pointer"
      // Attach touch event listeners for swipe navigation controls on mobile
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Viewport containing active image */}
      <div className="w-full h-full relative">
        <Image
          src={images[currentIdx]}
          alt={`${productName} - view ${currentIdx + 1}`}
          fill
          // Set adaptive size maps to inform browser page sizing lookups
          sizes="(max-width: 640px) 48vw, (max-width: 768px) 36vw, (max-width: 1024px) 26vw, (max-width: 1280px) 20vw, 17vw"
          // Conditionally dim opacity and apply a grayscale filter if the item is sold out
          className={`object-cover transition-opacity duration-300 ${
            isSoldOut ? "opacity-60 grayscale-[40%]" : ""
          }`}
        />
      </div>

      {/* Navigation Arrows overlay (visible if product contains more than 1 image) */}
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

      {/* Slide Indicators / Dots layout */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, idx) => (
            <span
              key={idx}
              // Active dot scales wider for visual distinction
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

