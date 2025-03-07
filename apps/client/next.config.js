/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['common'],
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api'
      : '/api'
  },
  // Disable static generation completely
  staticPageGenerationTimeout: 0,
  images: {
    domains: ['avatars.githubusercontent.com']
  }
}

module.exports = nextConfig 