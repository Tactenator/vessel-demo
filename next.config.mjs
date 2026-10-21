import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here

  experimental: {
    serverActions: {
      // Next.js Server Actions reject request bodies over 1MB by default, before the
      // action's own code ever runs — this silently blocked photo/document uploads
      // (createClient, uploadVehicleDocument), which routinely exceed that.
      bodySizeLimit: '25mb',
      // Server Actions also validate the request's Origin header against the app's
      // own host as CSRF protection. Behind a reverse proxy (Cloudflare), that check
      // needs the public domain(s) explicitly allowed or it can reject legitimate
      // requests. Update this list if the production domain changes again.
      allowedOrigins: ['sdhometransport.com', '*.sdhometransport.com'],
    },
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
