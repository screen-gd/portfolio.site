import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // The deployed site serves public/admin/index.html at /admin; the dev server needs a rewrite.
  ...(process.env.NODE_ENV === 'development' && {
    rewrites: async () => [{ source: '/admin', destination: '/admin/index.html' }],
  }),
};

export default nextConfig;
