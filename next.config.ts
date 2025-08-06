import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
  images: {
    unoptimized: true, // Desactiva la optimización de imágenes
  },
};

export default nextConfig;