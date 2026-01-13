import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression for smaller file sizes
  compress: true,

  // Optimize images for mobile
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    // Use modern image formats (WebP, AVIF) for smaller sizes
    formats: ['image/avif', 'image/webp'],
    // Optimize for mobile screen sizes
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Experimental features for faster loading
  experimental: {
    optimizeCss: true, // Optimize CSS
  },

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
