import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    typedRoutes: true,
  },
  // On Vercel, auto-resolve the API URL from the deployment domain.
  // VERCEL_URL is injected by Vercel at build time (e.g. "growfolo.vercel.app").
  // Locally, NEXT_PUBLIC_API_URL from .env.local takes over (default: localhost:8000).
  env: {
    NEXT_PUBLIC_API_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"),
  },
};

export default nextConfig;
