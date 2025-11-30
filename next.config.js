/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize for Vercel deployment
  images: {
    domains: [],
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
}

module.exports = nextConfig
