/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Removed standalone output which causes issues on Windows
  // output: 'standalone',
  // Ensure proper build configuration
  experimental: {
    // Removed outputFileTracing which causes warnings
    // outputFileTracing: true,
  },
}

export default nextConfig