"use client";

import { useState, ImgHTMLAttributes } from "react";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1550614000-4b95d4ebfa24?q=80&w=800&auto=format&fit=crop";

function optimizeCloudinaryUrl(url?: any): string {
  if (typeof url !== 'string' || !url) return typeof url === 'string' ? url : '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('f_auto') && !url.includes('q_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }
  return url;
}


export default function SafeImage({
  src,
  alt = "Calotes Vintage",
  fallbackSrc = DEFAULT_FALLBACK,
  className = "",
  ...props
}: SafeImageProps) {
  const [imgError, setImgError] = useState(false);

  const rawSrc = imgError || !src ? fallbackSrc : src;
  const effectiveSrc = optimizeCloudinaryUrl(rawSrc);

  return (
    <img
      {...props}
      src={effectiveSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!imgError) {
          setImgError(true);
        }
      }}
    />
  );
}

