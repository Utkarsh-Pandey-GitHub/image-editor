import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.fallback = { child_process: false };
    return config;
  },
};

export default nextConfig;
