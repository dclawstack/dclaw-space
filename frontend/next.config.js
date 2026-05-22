/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: "/api/:path*",    destination: `${BACKEND_URL}/api/:path*` },
      { source: "/auth/:path*",   destination: `${BACKEND_URL}/auth/:path*` },
      { source: "/health/:path*", destination: `${BACKEND_URL}/health/:path*` },
    ];
  },
};

module.exports = nextConfig
