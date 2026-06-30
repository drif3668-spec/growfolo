import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    typedRoutes: true,
  },
  env: {
    // On Vercel: use empty string → all fetch calls become relative paths
    // (/api/v1/...) which are same-origin regardless of custom domain.
    // Locally: use NEXT_PUBLIC_API_URL from .env.local (default: http://localhost:8000).
    NEXT_PUBLIC_API_URL: process.env.VERCEL_URL
      ? ""
      : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"),
  },
};

export default nextConfig;
