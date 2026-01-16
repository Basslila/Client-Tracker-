import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify deployment configuration
  images: {
    unoptimized: true, // Required for Netlify static exports
  },
};

export default nextConfig;
