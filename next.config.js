/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  /* config options here */
  transpilePackages: ["@ant-design/plots"],  images: {
    domains: ['example.com', 'res.cloudinary.com'],
  },
  webpack: (config) => {
    // This is needed to handle dynamic imports properly
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    return config;
  }
};

module.exports = nextConfig;
