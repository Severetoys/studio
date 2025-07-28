/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'w7.pngwing.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
       {
        protocol: 'https',
        hostname: 'scontent-gru2-2.cdninstagram.com',
      },
       {
        protocol: 'https',
        hostname: 'scontent-gru1-1.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com'
      }
    ],
  },
};

module.exports = nextConfig;
