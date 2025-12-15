import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker deployment
  output: "standalone",
  typescript: {
    // Skip TypeScript errors during build for faster deployment
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Production MinIO/CDN
      {
        protocol: "https",
        hostname: "cdn.grafikarsa.com",
      },
      // Development MinIO
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
    // Skip image optimization for local development
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;