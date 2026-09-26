/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-tabs',
      '@radix-ui/react-slot',
      'sonner',
    ],
  },
};

export default nextConfig;
