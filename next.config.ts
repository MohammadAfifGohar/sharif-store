import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thesharifstore.in",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
