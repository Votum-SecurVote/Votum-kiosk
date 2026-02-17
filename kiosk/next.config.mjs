/**
 * Next.js configuration options.
 * Disables some build-time checks for speed/flexibility.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
