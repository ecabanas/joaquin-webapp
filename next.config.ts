import type {NextConfig} from 'next';

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
    if (!isServer) {
        // Exclude server-only packages from client-side bundle
        config.resolve.fallback = {
            ...config.resolve.fallback,
            '@opentelemetry/exporter-jaeger': false,
            '@genkit-ai/firebase': false,
            'firebase-admin': false,
        };
    }

    return config;
  },
};

export default nextConfig;
