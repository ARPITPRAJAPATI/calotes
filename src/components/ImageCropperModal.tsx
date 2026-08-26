'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, Move, 
  RefreshCw, FlipHorizontal, FlipVertical, Crop, ArrowRight, Loader2, Maximize2
} from 'lucide-react';
import { compressImage } from '@/lib/clientImageCompressor';

interface ImageCropperModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void | Promise<void>;
  onSkipCrop?: (originalFile: File) => void | Promise<void>;
  onSkipAll?: () => void | Promise<void>;
  remainingCount?: number;
  defaultAspectRatio?: number; // e.g. 3/4 = 0.75 for products, 1 for square, 16/9 for banners
  title?: string;
}

export default function ImageCropperModal({
  file,
  isOpen,
  onClose,
  onCropComplete,
  onSkipCrop,
  onSkipAll,
  remainingCount = 1,
  defaultAspectRatio = 3 / 4,
  title = "Crop & Adjust Image",
}: ImageCropperModalProps) {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Crop adjustments
  const [aspectRatio, setAspectRatio] = useState<number>(defaultAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Drag / Pan tracking
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 440,
    height: 380,
  });

  // Load image safely whenever `file` changes
  useEffect(() => {
    if (!file || !isOpen) {
      setImageEl(null);
      setIsLoadingImage(false);
      return;
    }

    setIsLoadingImage(true);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setImageEl(img);
      setZoom(1);
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      setOffset({ x: 0, y: 0 });
      setAspectRatio(defaultAspectRatio);
      setIsLoadingImage(false);
    };

    img.onerror = () => {
      console.error('[ImageCropperModal] Failed to load image file');
      setIsLoadingImage(false);
    };

    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isOpen, defaultAspectRatio]);

  // Track container size dynamically with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const w = container.clientWidth || 440;
      const h = container.clientHeight || 380;
      setContainerSize({ width: w, height: h });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

  // Non-passive wheel event listener to eliminate Chrome console warnings
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 4));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  // Global mousemove and mouseup listeners for uninterrupted smooth dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Calculate output resolution based on target aspect ratio
  const getOutputDimensions = useCallback(() => {
    if (!imageEl) return { width: 1200, height: 1600 };
    
    // For wide banners (16:9), target 1920px wide; for others target 1200px
    let targetW = 1200;
    if (aspectRatio >= 1.7) {
      targetW = 1920;
    } else if (aspectRatio <= 0.8) {
      targetW = 1200;
    }

    const targetH = Math.round(targetW / (aspectRatio || 1));
    return { width: targetW, height: targetH };
  }, [imageEl, aspectRatio]);

  // Render crop preview canvas with Retina/High-DPI support
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const containerWidth = containerSize.width || 440;
    const containerHeight = containerSize.height || 380;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    // Calculate crop box bounds
    let cropW = containerWidth * 0.78;
    let cropH = cropW / (aspectRatio || 1);

    if (cropH > containerHeight * 0.78) {
      cropH = containerHeight * 0.78;
      cropW = cropH * (aspectRatio || 1);
    }

    const cropX = (containerWidth - cropW) / 2;
    const cropY = (containerHeight - cropH) / 2;

    // Draw clipped viewport image
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.clip();

    // Dark backdrop inside crop box
    ctx.fillStyle = '#141414';
    ctx.fillRect(cropX, cropY, cropW, cropH);

    // Calculate base scale to fit image inside crop box without cutting
    const isRotated90 = rotation === 90 || rotation === 270;
    const displayedWidth = isRotated90 ? imageEl.height : imageEl.width;
    const displayedHeight = isRotated90 ? imageEl.width : imageEl.height;
    const baseScale = Math.min(cropW / displayedWidth, cropH / displayedHeight);
    const currentScale = baseScale * zoom;

    // Center & transform image
    const centerX = cropX + cropW / 2 + offset.x;
    const centerY = cropY + cropH / 2 + offset.y;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipX ? -currentScale : currentScale, flipY ? -currentScale : currentScale);

    ctx.drawImage(
      imageEl,
      -imageEl.width / 2,
      -imageEl.height / 2,
      imageEl.width,
      imageEl.height
    );

    ctx.restore();

    // Draw dim overlay outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.rect(0, 0, containerWidth, containerHeight);
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.fill('evenodd');

    // Draw Crop Box Border (Terracotta accent)
    ctx.strokeStyle = '#c85a32';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Rule of thirds grid lines inside Crop Box
    ctx.strokeStyle = 'rgba(200, 90, 50, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical grid lines
    ctx.moveTo(cropX + cropW / 3, cropY);
    ctx.lineTo(cropX + cropW / 3, cropY + cropH);
    ctx.moveTo(cropX + (2 * cropW) / 3, cropY);
    ctx.lineTo(cropX + (2 * cropW) / 3, cropY + cropH);
    // Horizontal grid lines
    ctx.moveTo(cropX, cropY + cropH / 3);
    ctx.lineTo(cropX + cropW, cropY + cropH / 3);
    ctx.moveTo(cropX, cropY + (2 * cropH) / 3);
    ctx.lineTo(cropX + cropW, cropY + (2 * cropH) / 3);
    ctx.stroke();

    // Draw corner handles on crop box
    const handleSize = 12;
    ctx.fillStyle = '#c85a32';
    // Top-left
    ctx.fillRect(cropX - 2, cropY - 2, handleSize, 3);
    ctx.fillRect(cropX - 2, cropY - 2, 3, handleSize);
    // Top-right
    ctx.fillRect(cropX + cropW - handleSize + 2, cropY - 2, handleSize, 3);
    ctx.fillRect(cropX + cropW - 1, cropY - 2, 3, handleSize);
    // Bottom-left
    ctx.fillRect(cropX - 2, cropY + cropH - 1, handleSize, 3);
    ctx.fillRect(cropX - 2, cropY + cropH - handleSize + 2, 3, handleSize);
    // Bottom-right
    ctx.fillRect(cropX + cropW - handleSize + 2, cropY + cropH - 1, handleSize, 3);
    ctx.fillRect(cropX + cropW - 1, cropY + cropH - handleSize + 2, 3, handleSize);

    ctx.restore();
  }, [imageEl, aspectRatio, zoom, rotation, flipX, flipY, offset, containerSize]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Handle Drag & Pan (Mouse Start)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  // Handle Touch (1-Finger Pan & 2-Finger Pinch-to-Zoom for mobile/tablets)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setOffset({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = currentDist / touchStartDistRef.current;
      const newZoom = Math.min(Math.max(1, +(initialZoomRef.current * scaleFactor).toFixed(2)), 4);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Reset Adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setOffset({ x: 0, y: 0 });
    setAspectRatio(defaultAspectRatio);
  };

  // Export Cropped Image
  const handleCropAndSave = async () => {
    if (!imageEl || !file || isProcessing) return;

    setIsProcessing(true);
    try {
      const exportCanvas = document.createElement('canvas');
      const dims = getOutputDimensions();
      exportCanvas.width = dims.width;
      exportCanvas.height = dims.height;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // White background fallback for transparent images
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dims.width, dims.height);

      const containerWidth = containerSize.width || 440;
      const containerHeight = containerSize.height || 380;
      let cropW = containerWidth * 0.78;
      let cropH = cropW / (aspectRatio || 1);

      if (cropH > containerHeight * 0.78) {
        cropH = containerHeight * 0.78;
        cropW = cropH * (aspectRatio || 1);
      }

      const scale = dims.width / cropW;

      const isRotated90 = rotation === 90 || rotation === 270;
      const displayedWidth = isRotated90 ? imageEl.height : imageEl.width;
      const displayedHeight = isRotated90 ? imageEl.width : imageEl.height;
      const baseScale = Math.min(cropW / displayedWidth, cropH / displayedHeight);
      const exportScale = baseScale * zoom * scale;

      ctx.save();
      ctx.translate(dims.width / 2 + offset.x * scale, dims.height / 2 + offset.y * scale);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipX ? -exportScale : exportScale, flipY ? -exportScale : exportScale);

      ctx.drawImage(
        imageEl,
        -imageEl.width / 2,
        -imageEl.height / 2,
        imageEl.width,
        imageEl.height
      );

      ctx.restore();

      const outputFormat = 'image/webp';
      await new Promise<void>((resolve) => {
        exportCanvas.toBlob(
          async (blob) => {
            if (!blob) {
              resolve();
              return;
            }
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const croppedFile = new File([blob], `${baseName}.webp`, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            await onCropComplete(croppedFile);
            resolve();
          },
          outputFormat,
          0.88
        );
      });
    } catch (err) {
      console.error('[ImageCropperModal] Error during crop and export:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !file) return null;

  const dims = getOutputDimensions();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-bg/60">
            <div className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-terracotta" />
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-text">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-muted/80 uppercase bg-bg border border-border px-2 py-1 rounded">
                Export: {dims.width} × {dims.height} px
              </span>
              <button
                type="button"
                disabled={isProcessing}
                onClick={onClose}
                className="text-muted hover:text-text transition-colors p-1 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Canvas Crop Interactive Viewport */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleReset}
            className="relative w-full h-[380px] cursor-grab active:cursor-grabbing select-none bg-black overflow-hidden touch-none flex items-center justify-center"
          >
            {isLoadingImage ? (
              <div className="flex flex-col items-center gap-2 text-muted text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
                <span>Loading Image...</span>
              </div>
            ) : (
              <canvas ref={canvasRef} className="block select-none" />
            )}

            {/* Instruction Badges Overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-muted flex items-center gap-1.5 pointer-events-none border border-white/10">
                <Move size={10} className="text-terracotta" /> Drag to Pan
              </div>
              <div className="hidden sm:flex bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-muted items-center gap-1.5 pointer-events-none border border-white/10">
                <ZoomIn size={10} className="text-terracotta" /> Scroll / Pinch to Zoom
              </div>
            </div>

            {imageEl && (
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-mono text-muted/70 uppercase border border-white/10">
                Original: {imageEl.width} × {imageEl.height} px
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="p-5 space-y-4 bg-card border-t border-border overflow-y-auto max-h-[40vh]">
            {/* Aspect Ratio Presets */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">
                Aspect Ratio Presets
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setAspectRatio(3 / 4)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 3 / 4) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta font-black shadow-xs'
                      : 'border-border text-muted hover:text-text hover:bg-bg'
                  }`}
                >
                  3:4 Fashion
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(1)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 1) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta font-black shadow-xs'
                      : 'border-border text-muted hover:text-text hover:bg-bg'
                  }`}
                >
                  1:1 Square
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(16 / 9)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 16 / 9) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta font-black shadow-xs'
                      : 'border-border text-muted hover:text-text hover:bg-bg'
                  }`}
                >
                  16:9 Banner
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(4 / 3)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 4 / 3) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta font-black shadow-xs'
                      : 'border-border text-muted hover:text-text hover:bg-bg'
                  }`}
                >
                  4:3 Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (imageEl) {
                      setAspectRatio(imageEl.width / imageEl.height);
                    }
                  }}
                  className={`py-2 text-center rounded border transition-colors ${
                    imageEl && Math.abs(aspectRatio - imageEl.width / imageEl.height) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta font-black shadow-xs'
                      : 'border-border text-muted hover:text-text hover:bg-bg'
                  }`}
                >
                  Original
                </button>
              </div>
            </div>

            {/* Adjustments: Zoom, Rotation, Flip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
                  <span className="flex items-center gap-1">
                    <ZoomIn size={12} className="text-terracotta" /> Zoom ({zoom.toFixed(2)}x)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut size={12} className="text-muted shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-terracotta bg-border h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <ZoomIn size={12} className="text-muted shrink-0" />
                </div>
              </div>

              {/* Transform Tools (Rotate & Flip) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
                  <span>Transform & Reset</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                    className="flex-1 py-1.5 bg-bg border border-border text-[9px] font-bold uppercase tracking-widest text-text hover:border-terracotta transition-colors flex items-center justify-center gap-1 rounded"
                    title="Rotate 90° Left"
                  >
                    <RotateCcw size={11} /> 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex-1 py-1.5 bg-bg border border-border text-[9px] font-bold uppercase tracking-widest text-text hover:border-terracotta transition-colors flex items-center justify-center gap-1 rounded"
                    title="Rotate 90° Right"
                  >
                    <RotateCw size={11} /> 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipX((prev) => !prev)}
                    className={`p-1.5 bg-bg border text-[9px] rounded transition-colors ${
                      flipX ? 'border-terracotta text-terracotta' : 'border-border text-muted hover:text-text'
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipY((prev) => !prev)}
                    className={`p-1.5 bg-bg border text-[9px] rounded transition-colors ${
                      flipY ? 'border-terracotta text-terracotta' : 'border-border text-muted hover:text-text'
                    }`}
                    title="Flip Vertical"
                  >
                    <FlipVertical size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 bg-bg border border-border text-muted hover:text-text rounded transition-colors"
                    title="Reset All Adjustments"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-3">
                {onSkipCrop ? (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={async () => {
                      if (file && !isProcessing) {
                        setIsProcessing(true);
                        try {
                          const compressed = await compressImage(file);
                          onSkipCrop(compressed);
                        } finally {
                          setIsProcessing(false);
                        }
                      }
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-terracotta hover:underline py-1.5 flex items-center gap-1 disabled:opacity-50"
                    title="Upload optimized uncropped image"
                  >
                    {isProcessing ? <Loader2 size={11} className="animate-spin" /> : null}
                    Skip Crop <ArrowRight size={11} />
                  </button>
                ) : null}

                {onSkipAll && remainingCount > 1 ? (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={onSkipAll}
                    className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-text hover:underline py-1.5 flex items-center gap-1 border-l border-border pl-3 disabled:opacity-50"
                    title="Skip cropping for all queued images and upload immediately"
                  >
                    Skip All ({remainingCount})
                  </button>
                ) : null}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onClose}
                  className="btn-outline text-xs px-4 py-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing || isLoadingImage}
                  onClick={handleCropAndSave}
                  className="btn-primary text-xs px-5 py-2 flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Crop & Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
