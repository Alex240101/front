/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://back-wsp.onrender.com',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://back-wsp.onrender.com',
  },
  images: {
    domains: ['back-wsp.onrender.com'], // Updated image domains for production
    unoptimized: true
  },
  trailingSlash: true,
  experimental: {
    optimizeCss: true,
  },
  // Added eslint and typescript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
