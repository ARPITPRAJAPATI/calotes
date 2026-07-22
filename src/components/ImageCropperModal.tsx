'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, Move, RefreshCw, UploadCloud } from 'lucide-react';

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
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
      setOffset({ x: 0, y: 0 });
      setAspectRatio(defaultAspectRatio);
    };

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, defaultAspectRatio]);

  // Render crop preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = containerRef.current?.clientWidth || 400;
    const containerHeight = 360;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear background with dark grid theme
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate crop overlay box dimensions based on aspect ratio
    let cropW = containerWidth * 0.75;
    let cropH = cropW / (aspectRatio || 1);

    if (cropH > containerHeight * 0.75) {
      cropH = containerHeight * 0.75;
      cropW = cropH * (aspectRatio || 1);
    }

    const cropX = (containerWidth - cropW) / 2;
    const cropY = (containerHeight - cropH) / 2;

    ctx.save();

    // Clip rendering to the crop box viewport
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.clip();

    // Draw background inside crop box
    ctx.fillStyle = '#141414';
    ctx.fillRect(cropX, cropY, cropW, cropH);

    // Center transformation
    const centerX = cropX + cropW / 2 + offset.x;
    const centerY = cropY + cropH / 2 + offset.y;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    ctx.drawImage(
      imageEl,
      -imageEl.width / 2,
      -imageEl.height / 2,
      imageEl.width,
      imageEl.height
    );

    ctx.restore();

    // Draw Dark Overlay outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, containerWidth, containerHeight);
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.fill('evenodd');

    // Draw Crop Box Border & Grid Guidelines
    ctx.strokeStyle = '#c85a32'; // Terracotta accent
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Thirds Grid Lines inside Crop Box
    ctx.strokeStyle = 'rgba(200, 90, 50, 0.3)';
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
  }, [imageEl, aspectRatio, zoom, rotation, offset]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Handle Drag & Pan
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

  // Export cropped image
  const handleCropAndSave = () => {
    if (!imageEl || !file) return;

    // Create high-resolution export canvas
    const exportCanvas = document.createElement('canvas');
    const targetW = 1200;
    const targetH = targetW / (aspectRatio || 1);

    exportCanvas.width = targetW;
    exportCanvas.height = targetH;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Calculate scaling ratio from preview canvas to export canvas
    const containerWidth = containerRef.current?.clientWidth || 400;
    const containerHeight = 360;
    let cropW = containerWidth * 0.75;
    let cropH = cropW / (aspectRatio || 1);

    if (cropH > containerHeight * 0.75) {
      cropH = containerHeight * 0.75;
      cropW = cropH * (aspectRatio || 1);
    }

    const scale = targetW / cropW;

    ctx.save();
    ctx.translate(targetW / 2 + offset.x * scale, targetH / 2 + offset.y * scale);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom * scale, zoom * scale);

    ctx.drawImage(
      imageEl,
      -imageEl.width / 2,
      -imageEl.height / 2,
      imageEl.width,
      imageEl.height
    );

    ctx.restore();

    // Convert canvas to Blob File
    const fileType = file.type || 'image/jpeg';
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], file.name || 'cropped-image.jpg', {
          type: fileType,
          lastModified: Date.now(),
        });
        onCropComplete(croppedFile);
        onClose();
      },
      fileType,
      0.92 // High quality JPEG/PNG
    );
  };

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-bg/50">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-text flex items-center gap-2">
              <Move className="w-4 h-4 text-terracotta" /> {title}
            </h3>
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Canvas Crop Interactive Viewport */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full cursor-grab active:cursor-grabbing select-none bg-black overflow-hidden"
          >
            <canvas ref={canvasRef} className="w-full block" />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1.5 pointer-events-none">
              <Move size={10} className="text-terracotta" /> Drag to Pan Image
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-5 space-y-4 bg-card border-t border-border">
            {/* Aspect Ratio Selector Pills */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">
                Aspect Ratio Presets
              </label>
              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setAspectRatio(3 / 4)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 3 / 4) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta shadow-xs font-black'
                      : 'border-border text-muted hover:text-text'
                  }`}
                >
                  3:4 Fashion
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(1)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 1) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta shadow-xs font-black'
                      : 'border-border text-muted hover:text-text'
                  }`}
                >
                  1:1 Square
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(16 / 9)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 16 / 9) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta shadow-xs font-black'
                      : 'border-border text-muted hover:text-text'
                  }`}
                >
                  16:9 Banner
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(4 / 3)}
                  className={`py-2 text-center rounded border transition-colors ${
                    Math.abs(aspectRatio - 4 / 3) < 0.01
                      ? 'bg-terracotta text-bg border-terracotta shadow-xs font-black'
                      : 'border-border text-muted hover:text-text'
                  }`}
                >
                  4:3 Landscape
                </button>
              </div>
            </div>

            {/* Zoom Slider & Rotation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Zoom Control */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
                  <span className="flex items-center gap-1">
                    <ZoomIn size={12} className="text-terracotta" /> Zoom ({zoom.toFixed(1)}x)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut size={12} className="text-muted" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-terracotta bg-border h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <ZoomIn size={12} className="text-muted" />
                </div>
              </div>

              {/* Rotation Controls */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-1">
                  Rotation
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                    className="flex-1 py-1.5 bg-bg border border-border text-[10px] font-bold uppercase tracking-widest text-text hover:border-terracotta transition-colors flex items-center justify-center gap-1 rounded"
                  >
                    <RotateCcw size={11} /> 90° Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex-1 py-1.5 bg-bg border border-border text-[10px] font-bold uppercase tracking-widest text-text hover:border-terracotta transition-colors flex items-center justify-center gap-1 rounded"
                  >
                    <RotateCw size={11} /> 90° Right
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className="p-1.5 bg-bg border border-border text-muted hover:text-text rounded transition-colors"
                    title="Reset Adjustments"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              {onSkipCrop && (
                <button
                  type="button"
                  onClick={() => {
                    onSkipCrop(file);
                    onClose();
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-muted hover:text-text transition-colors px-3 py-2"
                >
                  Skip Crop
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="btn-outline text-xs px-4 py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropAndSave}
                className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
              >
                <Check size={14} /> Crop & Upload
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
