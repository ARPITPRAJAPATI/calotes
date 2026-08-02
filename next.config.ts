import type { NextConfig } from "next";

// PWA support using @ducanh2912/next-pwa
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});


const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js header to prevent framework fingerprinting
  poweredByHeader: false,

  compress: true,
  turbopack: {},
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/collections/:path*',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/collections',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/:path*',
        destination: '/shop',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // ── Static asset caching & CORS ────────────────────────────────────────────────
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, OPTIONS' },
        ],
      },

      // ── Security headers applied to every route ────────────────────────────
      {
        source: '/:path*',
        headers: [
          // Prevent MIME type sniffing — must-have to block content-type confusion attacks
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Block the page from being embedded in an iframe (clickjacking protection)
          // Critical for checkout and login pages where users enter credentials/payment info
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Strict Transport Security — forces HTTPS for 2 years, includes subdomains
          // Add to HSTS preload list at hstspreload.org once deployed to production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Control referrer information sent with outbound requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Disable unused browser features to reduce attack surface
          // Camera/mic/geolocation not needed for an e-commerce site
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          // Content Security Policy — restricts what resources can load on the page
          // This is a baseline policy; tighten further once all inline scripts are removed
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + Razorpay SDK + Google APIs + blob: (for WASM dynamic imports)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://checkout.razorpay.com https://apis.google.com",
              // Styles: self + inline styles (required for framer-motion and tailwind)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self + all remote images + data URIs + blobs
              "img-src 'self' data: blob: https: http:",
              // API fetch targets: self + Razorpay + Google OAuth + IMG.LY CDN
              "connect-src 'self' blob: https://api.razorpay.com https://lumberjack.razorpay.com https://accounts.google.com https://staticimgly.com",
              // Web Worker sources
              "worker-src 'self' blob:",
              // Razorpay payment iframe
              "frame-src https://api.razorpay.com https://checkout.razorpay.com",
              // Objects/embeds disabled
              "object-src 'none'",
              // Base URI locked to self (prevent base-tag injection)
              "base-uri 'self'",
              // Only allow form submissions to self
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);

