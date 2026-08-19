"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface FullScreenImageViewerProps {
  images: string[];
  initialIndex?: number;
  productName: string;
  onClose: () => void;
}

export default function FullScreenImageViewer({
  images,
  initialIndex = 0,
  productName,
  onClose,
}: FullScreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Gesture refs
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStartPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handlePrev = useCallback(() => {
    resetZoom();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length, resetZoom]);

  const handleNext = useCallback(() => {
    resetZoom();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length, resetZoom]);

  // Lock scroll & keyboard shortcuts
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(4, s + 0.5));
      if (e.key === "-") setScale((s) => Math.max(1, s - 0.5));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, handlePrev, handleNext]);

  // 1-Click / 1-Touch Toggle Zoom (1x <-> 2.5x)
  const toggleZoom = useCallback((clientX?: number, clientY?: number) => {
    setScale((prevScale) => {
      if (prevScale > 1) {
        // Zoomed in -> Reset back to 1x
        setPosition({ x: 0, y: 0 });
        return 1;
      } else {
        // Normal -> Zoom into 2.5x
        const targetScale = 2.5;
        if (containerRef.current && clientX !== undefined && clientY !== undefined) {
          const rect = containerRef.current.getBoundingClientRect();
          const offsetX = (rect.width / 2 - (clientX - rect.left)) * 1.3;
          const offsetY = (rect.height / 2 - (clientY - rect.top)) * 1.3;
          const maxPanX = (targetScale - 1) * (rect.width / 2);
          const maxPanY = (targetScale - 1) * (rect.height / 2);
          setPosition({
            x: Math.max(-maxPanX, Math.min(maxPanX, offsetX)),
            y: Math.max(-maxPanY, Math.min(maxPanY, offsetY)),
          });
        }
        return targetScale;
      }
    });
  }, []);

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 fingers: Pinch to zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      dragStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialPinchDistRef.current;
      const newScale = Math.min(4, Math.max(1, initialScaleRef.current * ratio));
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const touch = e.touches[0];
      const maxPanX = (scale - 1) * 320;
      const maxPanY = (scale - 1) * 420;
      const newX = touch.clientX - dragStartRef.current.x;
      const newY = touch.clientY - dragStartRef.current.y;
      setPosition({
        x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (initialPinchDistRef.current !== null) {
      initialPinchDistRef.current = null;
      if (scale < 1.1) resetZoom();
      setIsDragging(false);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      const endTouch = e.changedTouches[0];
      if (!endTouch) return;

      const deltaX = endTouch.clientX - touchStartPosRef.current.x;
      const deltaY = endTouch.clientY - touchStartPosRef.current.y;

      // 1-Touch Tap -> Toggle Zoom In / Zoom Out
      if (Math.abs(deltaX) < 14 && Math.abs(deltaY) < 14) {
        toggleZoom(endTouch.clientX, endTouch.clientY);
        return;
      }

      // Swipe Left / Right Navigation (when scale === 1)
      if (scale === 1 && Math.abs(deltaX) > 40) {
        if (deltaX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  };

  // Mouse Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    touchStartPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const maxPanX = (scale - 1) * 400;
      const maxPanY = (scale - 1) * 500;
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setPosition({
        x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      const deltaX = e.clientX - touchStartPosRef.current.x;
      const deltaY = e.clientY - touchStartPosRef.current.y;

      // 1-Click -> Toggle Zoom In / Zoom Out
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
        toggleZoom(e.clientX, e.clientY);
      }
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.3 : -0.3;
    const newScale = Math.min(4, Math.max(1, scale + zoomDelta));
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const currentImage = images[currentIndex];
  const isVideo = currentImage?.endsWith(".mp4");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[99999] bg-bg/98 backdrop-blur-2xl text-text flex flex-col justify-between select-none overflow-hidden"
    >
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 z-30 border-b border-border/20 bg-bg/90 backdrop-blur-md">
        {/* Left: Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 p-2 -ml-1 text-text hover:text-terracotta active:scale-95 transition-all cursor-pointer"
          aria-label="Close fullscreen view"
        >
          <X size={22} className="stroke-[2]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-text">Close</span>
        </button>

        {/* Center: Image Counter */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black tracking-[0.25em] uppercase text-terracotta">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider hidden sm:block max-w-[200px] truncate">
            {productName}
          </span>
        </div>

        {/* Right: Zoom In, Zoom Out, Reset Controls */}
        <div className="flex items-center gap-1">
          {scale > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              className="p-2 text-text/80 hover:text-terracotta active:scale-95 transition-colors cursor-pointer"
              title="Reset Zoom (1x)"
              aria-label="Reset Zoom"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(4, s + 0.5))}
            disabled={scale >= 4}
            className="p-2 text-text/80 hover:text-terracotta disabled:opacity-30 active:scale-95 transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              const newScale = Math.max(1, scale - 0.5);
              setScale(newScale);
              if (newScale === 1) setPosition({ x: 0, y: 0 });
            }}
            disabled={scale <= 1}
            className="p-2 text-text/80 hover:text-terracotta disabled:opacity-30 active:scale-95 transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
        </div>
      </div>

      {/* ── Main Canvas (Full-Length View, Tap/Click to Zoom, Drag to Pan) ── */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none ${
          scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative w-full h-full flex items-center justify-center p-2"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {isVideo ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="max-h-[82vh] w-auto max-w-[96vw] object-contain rounded"
              >
                <source src={currentImage} type="video/mp4" />
              </video>
            ) : (
              <img
                src={currentImage}
                alt={`${productName} - View ${currentIndex + 1}`}
                draggable={false}
                className="max-h-[82vh] w-auto max-w-[96vw] object-contain select-none"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ALWAYS VISIBLE Left & Right Floating Chevron Slide Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-bg/85 backdrop-blur-md text-text hover:bg-text hover:text-bg border border-border/50 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer z-40"
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} className="stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-bg/85 backdrop-blur-md text-text hover:bg-text hover:text-bg border border-border/50 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer z-40"
              aria-label="Next photo"
            >
              <ChevronRight size={22} className="stroke-[2.2]" />
            </button>
          </>
        )}
      </div>

      {/* ── Bottom: Minimalist Flipkart Pagination Dots ───────────────────── */}
      <div className="w-full pb-5 pt-2 flex items-center justify-center z-30">
        {images.length > 1 && (
          <div className="flex items-center gap-1.5 bg-bg/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/30 shadow-sm">
            {images.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                  setCurrentIndex(idx);
                }}
                className={`block rounded-full cursor-pointer transition-all duration-200 ${
                  idx === currentIndex
                    ? "w-4 h-1.5 bg-terracotta"
                    : "w-1.5 h-1.5 bg-muted/40 hover:bg-muted/70"
                }`}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
