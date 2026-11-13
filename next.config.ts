import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep page titles and other metadata in the initial HTML so the browser
  // never falls back to displaying the localhost URL while metadata streams.
  htmlLimitedBots: /.*/,
  experimental: {
    staticGenerationRetryCount: 2,
    // The persistent Turbopack dev cache grew past 800 MB and its writes
    // (minutes long on this machine) stalled `next dev`. Keep dev in-memory.
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.thesharifstore.in",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
