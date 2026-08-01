"use client";

import { useState, ImgHTMLAttributes } from "react";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1550614000-4b95d4ebfa24?q=80&w=800&auto=format&fit=crop";

export default function SafeImage({
  src,
  alt = "Calotes Vintage",
  fallbackSrc = DEFAULT_FALLBACK,
  className = "",
  ...props
}: SafeImageProps) {
  const [imgError, setImgError] = useState(false);

  const effectiveSrc = imgError || !src ? fallbackSrc : src;

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
