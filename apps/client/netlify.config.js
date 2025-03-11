module.exports = {
  buildCommand: 'cd ../.. && pnpm install && pnpm build:common && cd apps/client && pnpm build',
  outputDirectory: '.next',
  devCommand: 'pnpm dev',
  installCommand: 'pnpm install',
  framework: 'nextjs'
} 