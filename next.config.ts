import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  async headers() {
    const securityHeaders = [
      // Force HTTPS for the next year (preload-eligible)
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      // Stop browsers guessing MIME types — closes a class of XSS
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Block this site from being framed (clickjacking)
      { key: 'X-Frame-Options', value: 'DENY' },
      // Don't leak full URL in Referer headers across origins
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Disable browser features the app doesn't use
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
      },
      // Belt-and-braces clickjacking protection (modern equivalent of X-Frame-Options)
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
    ];
  },
};

export default nextConfig;
