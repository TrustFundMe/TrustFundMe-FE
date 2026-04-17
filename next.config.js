/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel / Node SSR (default). No GitHub Pages basePath/export hacks.
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    // Skip server-side optimization - images from Supabase CDN are already optimized.
    // Prevents "400 received null" when Next.js server can't proxy external image URLs.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'rdfdalbhvpszkyetmraq.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: `${process.env.BE_API_GATEWAY_URL || 'http://localhost:8080'}/:path*`,
      },
    ];
  },
  experimental: {
    middlewareClientMaxBodySize: '50mb',
  },
};

module.exports = nextConfig;
