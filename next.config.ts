import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  // Hard requirement (SRS §5.4): the whole product must work as a static export
  // so it can live on any free static host forever.
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  images: {
    // Optimisation happens at build time via scripts/fetch-demo-assets.ts (sharp).
    unoptimized: true,
    // A10 — never fetch remote images server-side.
    remotePatterns: [],
  },
  pageExtensions: ['ts', 'tsx', 'mdx'],
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true }, // linting runs as its own CI step
  env: {
    NEXT_PUBLIC_IS_DEV_BUILD: isDev ? '1' : '0',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'culori', 'date-fns'],
  },
};

export default nextConfig;
