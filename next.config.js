/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    transpilePackages: ['tdesign-react'],
  },
}

module.exports = nextConfig
