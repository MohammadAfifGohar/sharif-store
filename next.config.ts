import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep page titles and other metadata in the initial HTML so the browser
  // never falls back to displaying the localhost URL while metadata streams.
  htmlLimitedBots: /.*/,
  experimental: {
    staticGenerationRetryCount: 2,
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
