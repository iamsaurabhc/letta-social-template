/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['common'],
  output: 'standalone',
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  staticPageGenerationTimeout: 0,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
    unoptimized: true
  },
  compress: true
}

module.exports = nextConfig 