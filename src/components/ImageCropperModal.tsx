'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, Move, 
  RefreshCw, FlipHorizontal, FlipVertical, Crop, ArrowRight
} from 'lucide-react';

interface ImageCropperModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop?: (originalFile: File) => void;
  defaultAspectRatio?: number; // e.g. 3/4 = 0.75 for product shots, 1 for square, 16/9 for banners
  title?: string;
}

export default function ImageCropperModal({
  file,
  isOpen,
  onClose,
  onCropComplete,
  onSkipCrop,
  defaultAspectRatio = 3 / 4,
  title = "Crop & Adjust Image",
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  
  // Crop adjustments
  const [aspectRatio, setAspectRatio] = useState<number>(defaultAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Drag / Pan tracking
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      setImageEl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      setImageEl(img);
      setZoom(1);
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      setOffset({ x: 0, y: 0 });
      setAspectRatio(defaultAspectRatio);
    };

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, defaultAspectRatio]);

  // Calculate live output dimensions
  const getOutputDimensions = useCallback(() => {
    if (!imageEl) return { width: 1200, height: 1600 };
    const targetW = 1200;
    const targetH = Math.round(targetW / (aspectRatio || 1));
    return { width: targetW, height: targetH };
  }, [imageEl, aspectRatio]);

  // Render crop preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const containerWidth = containerRef.current?.clientWidth || 440;
    const containerHeight = 380;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear canvas background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate crop box bounds
    let cropW = containerWidth * 0.78;
    let cropH = cropW / (aspectRatio || 1);

    if (cropH > containerHeight * 0.78) {
      cropH = containerHeight * 0.78;
      cropW = cropH * (aspectRatio || 1);
    }

    const cropX = (containerWidth - cropW) / 2;
    const cropY = (containerHeight - cropH) / 2;

    ctx.save();

    // Clip rendering strictly to crop viewport
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.clip();

    // Dark backdrop inside crop box
    ctx.fillStyle = '#141414';
    ctx.fillRect(cropX, cropY, cropW, cropH);

    // Calculate base scale to fit entire image inside crop box without auto zooming in
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

    // Draw image centered
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
    const handleSize = 10;
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
  }, [imageEl, aspectRatio, zoom, rotation, flipX, flipY, offset]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Handle Drag & Pan (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Touch Pan (Mobile / Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 4));
  };

  // Reset All Adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setOffset({ x: 0, y: 0 });
    setAspectRatio(defaultAspectRatio);
  };

  // Export Cropped Image to High-Res File
  const handleCropAndSave = () => {
    if (!imageEl || !file) return;

    const exportCanvas = document.createElement('canvas');
    const dims = getOutputDimensions();
    exportCanvas.width = dims.width;
    exportCanvas.height = dims.height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // White background fallback for transparent PNGs converted to JPEG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dims.width, dims.height);

    const containerWidth = containerRef.current?.clientWidth || 440;
    const containerHeight = 380;
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

    const fileType = file.type || 'image/jpeg';
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], file.name || 'cropped-image.jpg', {
          type: fileType,
          lastModified: Date.now(),
        });
        onCropComplete(croppedFile);
      },
      fileType,
      0.92
    );
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
                onClick={onClose}
                className="text-muted hover:text-text transition-colors p-1"
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
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="relative w-full cursor-grab active:cursor-grabbing select-none bg-black overflow-hidden touch-none"
          >
            <canvas ref={canvasRef} className="w-full block" />

            {/* Instruction Badges Overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-muted flex items-center gap-1.5 pointer-events-none border border-white/10">
                <Move size={10} className="text-terracotta" /> Drag to Pan
              </div>
              <div className="hidden sm:flex bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-muted items-center gap-1.5 pointer-events-none border border-white/10">
                <ZoomIn size={10} className="text-terracotta" /> Scroll Wheel Zoom
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
              <div>
                {onSkipCrop ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (file) onSkipCrop(file);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-terracotta hover:underline px-2 py-2 flex items-center gap-1.5"
                    title="Upload original uncropped image file as-is"
                  >
                    Skip Crop <ArrowRight size={11} />
                  </button>
                ) : (
                  <span />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropAndSave}
                  className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
                >
                  <Check size={14} /> Crop & Upload
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
