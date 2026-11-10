import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  env: {
    // On Vercel: empty string makes every fetch a same-origin relative path
    // ("/api/v1/...") which vercel.json routes to the Python function.
    // Locally: NEXT_PUBLIC_API_URL from .env.local (default: localhost:8000).
    NEXT_PUBLIC_API_URL: process.env.VERCEL_URL
      ? ""
      : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
