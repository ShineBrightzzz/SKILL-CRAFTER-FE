import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  /* config options here */
  transpilePackages: ["@ant-design/plots"],
  webpack: (config) => {
    // This is needed to handle dynamic imports properly
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    return config;
  }
  
};

export default nextConfig;
