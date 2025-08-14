import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'via.placeholder.com',
      'images.unsplash.com',
      'images.pexels.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'blog-next-1324789722.cos.ap-guangzhou.myqcloud.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blog-next-1324789722.cos.ap-guangzhou.myqcloud.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
