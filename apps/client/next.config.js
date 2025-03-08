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
  runtime: 'nodejs',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SERVER_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001'
      : process.env.NEXT_PUBLIC_SERVER_URL
  },
  images: {
    domains: ['avatars.githubusercontent.com']
  }
}

module.exports = nextConfig 