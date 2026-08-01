import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
