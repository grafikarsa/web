import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
    // Skip image optimization for local development
    // This allows loading images from localhost:9000 (MinIO)
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;