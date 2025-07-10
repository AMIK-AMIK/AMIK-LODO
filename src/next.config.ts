
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is a workaround for a build warning caused by a dependency of Genkit.
    // The '@opentelemetry/exporter-jaeger' package is not found, but it's not needed for the app to run.
    // We can safely ignore it by resolving it to an empty module.
    config.resolve.alias['@opentelemetry/exporter-jaeger'] = false;
    return config;
  },
};

export default withPWA(nextConfig);
