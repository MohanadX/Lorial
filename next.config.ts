import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── Core ────────────────────────────────────────────────────────────────
  reactCompiler: true,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false, // remove X-Powered-By: Next.js header

  // ─── SWC compiler transforms ─────────────────────────────────────────────
  compiler: {
    // Strip console.log / debug / info / warn in production; keep .error
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // ─── Experimental ────────────────────────────────────────────────────────
  experimental: {
    typedEnv: true,
    optimizePackageImports: [
      "lucide-react",
      "@heroicons/react",
      "react-icons",
      "axios",
      "sonner",
    ],
  },
  turbopack: {
    resolveAlias: {
      "next/dist/build/polyfills/polyfill-module": "", // to stop polyfills
    },
  },
  // ─── Images ──────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },

  // ─── Logging ─────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ─── Caching ─────────────────────────────────────────────────────────────
  cacheComponents: true,
  partialPrefetching: true,

  // ─── Routing ─────────────────────────────────────────────────────────────
  skipTrailingSlashRedirect: true,

  // ─── PostHog ingestion proxy ─────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
