/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: process.env.PUBLIC_APP_AWS_CLOUDFRONT_DOMAIN,
      },
    ],
  },
};

module.exports = nextConfig;
