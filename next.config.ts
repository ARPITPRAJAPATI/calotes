import type { NextConfig } from "next";

// PWA support using next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  compress: true,
  turbopack: {},
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|js|css)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
