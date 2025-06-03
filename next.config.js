/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  /* config options here */
  transpilePackages: ["@ant-design/plots", "@casl/ability"],
  images: {
    domains: ['example.com', 'res.cloudinary.com', 'img.vietqr.io'],
  },  webpack: (config) => {
    // This is needed to handle dynamic imports properly
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    
    // Handle ESM modules properly
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@casl/ability': require.resolve('@casl/ability'),
    };
    
    return config;
  },
  // Add proxy for API requests to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  }
};

module.exports = nextConfig;
