import type { NextConfig } from "next";

const apiUrl = process.env.API_URL || "http://localhost:3001";

const config: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  output: "standalone",
  transpilePackages: ["@inflow/core", "@inflow/db", "@inflow/types", "@inflow/logger", "@inflow/cache"],
  serverExternalPackages: ["pino", "pino-pretty"],
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline' https://flagsapi.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://flagsapi.com https://api.iconify.design; font-src 'self'; connect-src 'self' ${apiUrl} http://localhost:3000 http://localhost:3001 http://localhost:3002 https://free.freeipapi.com https://cdn.jsdelivr.net https://api.github.com;`,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default config;