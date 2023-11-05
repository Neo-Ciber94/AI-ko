const withPWA = require("next-pwa")({
  dest: "public",
  disable: !!process.env.PWA_DISABLED,
});

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

module.exports = withPWA(nextConfig);
