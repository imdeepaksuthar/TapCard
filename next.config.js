/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async redirects() {
    return [
      {
        source: '/c/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
