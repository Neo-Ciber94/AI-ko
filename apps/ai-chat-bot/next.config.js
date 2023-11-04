/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "d202dpugatkpqw.cloudfront.net",
      },
    ],
  },
};

module.exports = nextConfig;
