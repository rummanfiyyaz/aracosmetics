/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use memory cache in dev to avoid "Array buffer allocation failed" errors
      config.cache = { type: 'memory' }
    }
    return config
  },
}

export default nextConfig
